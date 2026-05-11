import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { nutrient } from "../src/lib/db/schema/food";
import nutrientsData from "../src/data/nutrients.json";

async function main() {
  const url = process.env.TURSO_DATABASE_URL || "file:dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log(`Seeding ${nutrientsData.length} nutrients...`);

  for (const n of nutrientsData) {
    await db
      .insert(nutrient)
      .values({
        id: n.id,
        key: n.key,
        name: n.name,
        unitCanonical: n.unitCanonical,
        kind: n.kind as "mass" | "energy" | "iu",
        upperLimitSupported: n.upperLimitSupported,
      })
      .onConflictDoUpdate({
        target: nutrient.id,
        set: {
          key: n.key,
          name: n.name,
          unitCanonical: n.unitCanonical,
          kind: n.kind as "mass" | "energy" | "iu",
          upperLimitSupported: n.upperLimitSupported,
        },
      });
  }

  console.log(`✅ Seeded ${nutrientsData.length} nutrients.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
