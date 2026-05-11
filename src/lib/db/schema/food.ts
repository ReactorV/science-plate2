import { sqliteTable, text, integer, real, primaryKey, index } from "drizzle-orm/sqlite-core";

// Nutrient dictionary
export const nutrient = sqliteTable("nutrient", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  unitCanonical: text("unit_canonical").notNull(),
  kind: text("kind", { enum: ["mass", "energy", "iu"] }).notNull(),
  upperLimitSupported: integer("upper_limit_supported", { mode: "boolean" })
    .notNull()
    .default(false),
});

// Data source registry
export const foodSource = sqliteTable("food_source", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  license: text("license"),
  refreshFreq: text("refresh_freq"),
  provenanceTier: text("provenance_tier", {
    enum: ["analytical", "branded", "calculated", "user", "photo"],
  }).notNull(),
  sourceUrl: text("source_url"),
});

// Canonical food identity
export const canonicalFood = sqliteTable(
  "canonical_food",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    foodGroup: text("food_group"),
    processingLevel: text("processing_level"),
    locale: text("locale"),
    completenessScore: real("completeness_score").notNull().default(0),
  },
  (table) => [index("idx_canonical_food_name").on(table.name)],
);

// Source-specific variant
export const foodVariant = sqliteTable(
  "food_variant",
  {
    id: text("id").primaryKey(),
    canonicalFoodId: text("canonical_food_id")
      .notNull()
      .references(() => canonicalFood.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => foodSource.id),
    brand: text("brand"),
    rawNutrientsJson: text("raw_nutrients_json"),
    completenessScore: real("completeness_score").notNull().default(0),
    provenanceTier: text("provenance_tier", {
      enum: ["analytical", "branded", "calculated", "user", "photo"],
    }).notNull(),
  },
  (table) => [index("idx_food_variant_canonical").on(table.canonicalFoodId)],
);

// Serving size conversion
export const portionUnit = sqliteTable("portion_unit", {
  id: text("id").primaryKey(),
  canonicalFoodId: text("canonical_food_id")
    .notNull()
    .references(() => canonicalFood.id, { onDelete: "cascade" }),
  weightUg: integer("weight_ug").notNull(), // weight in µg (canonical sub-unit)
  householdLabel: text("household_label").notNull(),
  densityHint: real("density_hint"),
});

// Core nutrient store
export const foodNutrientValue = sqliteTable(
  "food_nutrient_value",
  {
    foodVariantId: text("food_variant_id")
      .notNull()
      .references(() => foodVariant.id, { onDelete: "cascade" }),
    nutrientId: text("nutrient_id")
      .notNull()
      .references(() => nutrient.id),
    amount: integer("amount").notNull(), // canonical sub-unit (µg for mass, kcal×10 for energy)
    derivation: text("derivation"),
    analyticalFlag: integer("analytical_flag", { mode: "boolean" }).default(false),
  },
  (table) => [
    primaryKey({ columns: [table.foodVariantId, table.nutrientId] }),
    index("idx_fnv_nutrient").on(table.nutrientId),
  ],
);
