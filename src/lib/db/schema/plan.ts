import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { authUser } from "./auth";
import { foodVariant } from "./food";

export const dayPlan = sqliteTable(
  "day_plan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // ISO date
    evidencePackVersion: text("evidence_pack_version"),
    calculationHash: text("calculation_hash"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("idx_day_plan_user_date").on(table.userId, table.date)],
);

export const meal = sqliteTable(
  "meal",
  {
    id: text("id").primaryKey(),
    dayPlanId: text("day_plan_id")
      .notNull()
      .references(() => dayPlan.id, { onDelete: "cascade" }),
    mealType: text("meal_type", {
      enum: ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"],
    }).notNull(),
    time: text("time").notNull(), // HH:MM
    name: text("name").notNull(),
    notes: text("notes"),
  },
  (table) => [index("idx_meal_day_plan").on(table.dayPlanId)],
);

export const mealItem = sqliteTable(
  "meal_item",
  {
    id: text("id").primaryKey(),
    mealId: text("meal_id")
      .notNull()
      .references(() => meal.id, { onDelete: "cascade" }),
    foodVariantId: text("food_variant_id")
      .notNull()
      .references(() => foodVariant.id),
    portionUg: integer("portion_ug").notNull(), // serving size in µg (canonical sub-unit)
    timingOffsetMin: integer("timing_offset_min").default(0),
  },
  (table) => [index("idx_meal_item_meal").on(table.mealId)],
);

export const supplementEntry = sqliteTable("supplement_entry", {
  id: text("id").primaryKey(),
  dayPlanId: text("day_plan_id")
    .notNull()
    .references(() => dayPlan.id, { onDelete: "cascade" }),
  time: text("time").notNull(), // HH:MM
  nutrientId: text("nutrient_id").notNull(),
  amount: integer("amount").notNull(), // canonical sub-unit
  sourceText: text("source_text"),
});
