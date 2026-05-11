import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { referencePack, referenceValue } from "../src/lib/db/schema/reference";
import efsaData from "../src/data/reference-packs/efsa-2017.json";
import usDriData from "../src/data/reference-packs/us-dri-2019.json";

async function seedPack(
  db: ReturnType<typeof drizzle>,
  pack: typeof efsaData,
) {
  await db
    .insert(referencePack)
    .values({
      id: pack.id,
      authority: pack.authority,
      geography: pack.geography,
      version: pack.version,
      effectiveFrom: pack.effectiveFrom,
      changelogUrl: pack.changelogUrl,
    })
    .onConflictDoUpdate({
      target: referencePack.id,
      set: {
        authority: pack.authority,
        version: pack.version,
        effectiveFrom: pack.effectiveFrom,
        changelogUrl: pack.changelogUrl,
      },
    });

  for (const v of pack.values) {
    await db
      .insert(referenceValue)
      .values({
        packId: pack.id,
        nutrientId: v.nutrientId,
        sex: v.sex as "M" | "F",
        ageMin: v.ageMin,
        ageMax: v.ageMax,
        valueType: v.valueType as "AR" | "PRI" | "AI" | "UL",
        amount: v.amount,
      })
      .onConflictDoUpdate({
        target: [
          referenceValue.packId,
          referenceValue.nutrientId,
          referenceValue.sex,
          referenceValue.ageMin,
          referenceValue.valueType,
        ],
        set: { amount: v.amount, ageMax: v.ageMax },
      });
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL || "file:dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log("Seeding EFSA-2017...");
  await seedPack(db, efsaData);
  console.log(`  ✅ ${efsaData.values.length} values`);

  console.log("Seeding US-DRI-2019...");
  await seedPack(db, usDriData);
  console.log(`  ✅ ${usDriData.values.length} values`);

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
