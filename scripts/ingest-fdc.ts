/**
 * FDC Ingestion CLI — imports USDA FoodData Central foods into canonical_food + food_variant + food_nutrient_value.
 *
 * Usage:
 *   FDC_API_KEY=xxx yarn tsx scripts/ingest-fdc.ts [--limit 100] [--type foundation|fndds]
 *
 * Requires FDC_API_KEY env var from https://fdc.nal.usda.gov/api-key-signup
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const FDC_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const FDC_SOURCE_ID = "usda-fdc";

// Nutrient ID map: FDC nutrient number → our nutrient key
const FDC_NUTRIENT_MAP: Record<number, string> = {
  1008: "energy",
  1003: "protein",
  1004: "total_fat",
  1005: "carbohydrate",
  1079: "fibre",
  1087: "calcium",
  1089: "iron",
  1090: "magnesium",
  1091: "phosphorus",
  1092: "potassium",
  1093: "sodium",
  1095: "zinc",
  1098: "copper",
  1101: "manganese",
  1103: "selenium",
  1104: "vitamin_a",
  1162: "vitamin_c",
  1110: "vitamin_d",
  1109: "vitamin_e",
  1185: "vitamin_k",
  1165: "thiamin",
  1166: "riboflavin",
  1167: "niacin",
  1170: "pantothenic_acid",
  1175: "vitamin_b6",
  1177: "folate",
  1178: "vitamin_b12",
  1106: "retinol",
  1180: "choline",
  1114: "vitamin_d3",
};

// Conversion from FDC units (per 100g) to our canonical sub-units
const UNIT_CONVERTERS: Record<string, (val: number) => number> = {
  energy: (kcal) => Math.round(kcal * 10), // kcal×10
  protein: (g) => Math.round(g * 1_000_000), // g → µg
  total_fat: (g) => Math.round(g * 1_000_000),
  carbohydrate: (g) => Math.round(g * 1_000_000),
  fibre: (g) => Math.round(g * 1_000_000),
  calcium: (mg) => Math.round(mg * 1_000), // mg → µg
  iron: (mg) => Math.round(mg * 1_000),
  magnesium: (mg) => Math.round(mg * 1_000),
  phosphorus: (mg) => Math.round(mg * 1_000),
  potassium: (mg) => Math.round(mg * 1_000),
  sodium: (mg) => Math.round(mg * 1_000),
  zinc: (mg) => Math.round(mg * 1_000),
  copper: (mg) => Math.round(mg * 1_000),
  manganese: (mg) => Math.round(mg * 1_000),
  selenium: (ug) => Math.round(ug), // already µg
  vitamin_a: (ug) => Math.round(ug),
  vitamin_c: (mg) => Math.round(mg * 1_000),
  vitamin_d: (ug) => Math.round(ug),
  vitamin_e: (mg) => Math.round(mg * 1_000),
  vitamin_k: (ug) => Math.round(ug),
  thiamin: (mg) => Math.round(mg * 1_000),
  riboflavin: (mg) => Math.round(mg * 1_000),
  niacin: (mg) => Math.round(mg * 1_000),
  pantothenic_acid: (mg) => Math.round(mg * 1_000),
  vitamin_b6: (mg) => Math.round(mg * 1_000),
  folate: (ug) => Math.round(ug),
  vitamin_b12: (ug) => Math.round(ug),
  retinol: (ug) => Math.round(ug),
  choline: (mg) => Math.round(mg * 1_000),
  vitamin_d3: (ug) => Math.round(ug),
};

interface FdcFood {
  fdcId: number;
  description: string;
  foodCategory?: { description: string };
  foodNutrients: Array<{
    nutrient: { id: number; name: string; unitName: string };
    amount?: number;
  }>;
  foodPortions?: Array<{
    gramWeight: number;
    portionDescription: string;
  }>;
}

async function fetchFdcFoods(
  apiKey: string,
  dataType: string,
  pageSize: number,
  pageNumber: number,
): Promise<FdcFood[]> {
  const url = `${FDC_API_BASE}/foods/list?api_key=${apiKey}&dataType=${dataType}&pageSize=${pageSize}&pageNumber=${pageNumber}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`FDC API error: ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function fetchFdcFoodDetail(apiKey: string, fdcId: number): Promise<FdcFood> {
  const url = `${FDC_API_BASE}/food/${fdcId}?api_key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`FDC API error: ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function main() {
  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) {
    console.error("FDC_API_KEY env var required. Get one at https://fdc.nal.usda.gov/api-key-signup");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 50;
  const typeIdx = args.indexOf("--type");
  const dataType = typeIdx >= 0 ? args[typeIdx + 1] : "Foundation";

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  // Ensure FDC source exists
  const existingSource = await db.select().from(schema.foodSource).where(eq(schema.foodSource.id, FDC_SOURCE_ID));
  if (existingSource.length === 0) {
    await db.insert(schema.foodSource).values({
      id: FDC_SOURCE_ID,
      name: "USDA FoodData Central",
      license: "Public Domain",
      refreshFreq: "quarterly",
      provenanceTier: "analytical",
      sourceUrl: "https://fdc.nal.usda.gov/",
    });
  }

  // Load our nutrient IDs
  const nutrients = await db.select().from(schema.nutrient);
  const nutrientKeyToId = new Map(nutrients.map((n) => [n.key, n.id]));

  console.log(`Fetching up to ${limit} ${dataType} foods from FDC...`);

  let imported = 0;
  let page = 1;
  const pageSize = Math.min(limit, 50);

  while (imported < limit) {
    const foods = await fetchFdcFoods(apiKey, dataType, pageSize, page);
    if (foods.length === 0) break;

    for (const food of foods) {
      if (imported >= limit) break;

      // Fetch full detail for nutrients
      const detail = await fetchFdcFoodDetail(apiKey, food.fdcId);
      const canonId = `fdc-${detail.fdcId}`;
      const variantId = `fdc-v-${detail.fdcId}`;

      // Upsert canonical food
      await db
        .insert(schema.canonicalFood)
        .values({
          id: canonId,
          name: detail.description,
          foodGroup: detail.foodCategory?.description ?? null,
          locale: "US",
          completenessScore: 0,
        })
        .onConflictDoNothing();

      // Upsert variant
      await db
        .insert(schema.foodVariant)
        .values({
          id: variantId,
          canonicalFoodId: canonId,
          sourceId: FDC_SOURCE_ID,
          rawNutrientsJson: JSON.stringify(detail.foodNutrients),
          completenessScore: 0,
          provenanceTier: "analytical",
        })
        .onConflictDoNothing();

      // Insert nutrient values
      let nutrientCount = 0;
      for (const fn of detail.foodNutrients) {
        if (fn.amount == null || fn.amount === 0) continue;
        const ourKey = FDC_NUTRIENT_MAP[fn.nutrient.id];
        if (!ourKey) continue;
        const nutrientId = nutrientKeyToId.get(ourKey);
        if (!nutrientId) continue;
        const converter = UNIT_CONVERTERS[ourKey];
        if (!converter) continue;

        const canonicalAmount = converter(fn.amount);
        await db
          .insert(schema.foodNutrientValue)
          .values({
            foodVariantId: variantId,
            nutrientId,
            amount: canonicalAmount,
            derivation: "fdc-import",
            analyticalFlag: true,
          })
          .onConflictDoNothing();
        nutrientCount++;
      }

      // Update completeness score
      const completeness = nutrientCount / 30; // 30 canonical nutrients
      await db
        .update(schema.canonicalFood)
        .set({ completenessScore: Math.round(completeness * 100) / 100 })
        .where(eq(schema.canonicalFood.id, canonId));
      await db
        .update(schema.foodVariant)
        .set({ completenessScore: Math.round(completeness * 100) / 100 })
        .where(eq(schema.foodVariant.id, variantId));

      // Portions
      if (detail.foodPortions) {
        for (const portion of detail.foodPortions) {
          await db
            .insert(schema.portionUnit)
            .values({
              id: `${variantId}-${portion.portionDescription.slice(0, 20).replace(/\s/g, "-")}`,
              canonicalFoodId: canonId,
              weightUg: Math.round(portion.gramWeight * 1_000_000), // g → µg
              householdLabel: portion.portionDescription,
            })
            .onConflictDoNothing();
        }
      }

      imported++;
      console.log(`  [${imported}/${limit}] ${detail.description} (${nutrientCount} nutrients)`);
    }
    page++;
  }

  console.log(`\nDone. Imported ${imported} foods.`);
}

main().catch(console.error);
