import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";
import { nutrient } from "./food";

export const referencePack = sqliteTable("reference_pack", {
  id: text("id").primaryKey(),
  authority: text("authority").notNull(),
  geography: text("geography").notNull(),
  version: text("version").notNull(),
  effectiveFrom: text("effective_from").notNull(),
  changelogUrl: text("changelog_url"),
});

export const referenceValue = sqliteTable(
  "reference_value",
  {
    packId: text("pack_id")
      .notNull()
      .references(() => referencePack.id, { onDelete: "cascade" }),
    nutrientId: text("nutrient_id")
      .notNull()
      .references(() => nutrient.id),
    sex: text("sex", { enum: ["M", "F"] }).notNull(),
    ageMin: integer("age_min").notNull(),
    ageMax: integer("age_max").notNull(),
    lifeStage: text("life_stage").default("adult"),
    valueType: text("value_type", { enum: ["AR", "PRI", "AI", "UL"] }).notNull(),
    amount: integer("amount").notNull(), // canonical sub-unit
  },
  (table) => [
    primaryKey({ columns: [table.packId, table.nutrientId, table.sex, table.ageMin, table.valueType] }),
    index("idx_ref_value_lookup").on(table.packId, table.nutrientId, table.sex, table.ageMin, table.ageMax),
  ],
);
