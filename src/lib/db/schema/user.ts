import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { authUser } from "./auth";
import { referencePack } from "./reference";

export const userProfile = sqliteTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => authUser.id, { onDelete: "cascade" }),
  sex: text("sex", { enum: ["M", "F"] }).notNull(),
  dob: text("dob").notNull(), // ISO date string
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  dietaryPattern: text("dietary_pattern", {
    enum: ["omnivore", "pescatarian", "vegetarian", "vegan"],
  }).notNull(),
  locale: text("locale", { enum: ["EU", "US"] }).notNull().default("EU"),
  referencePackId: text("reference_pack_id")
    .notNull()
    .references(() => referencePack.id)
    .default("EFSA-2017"),
});

export const goalProfile = sqliteTable("goal_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  goalType: text("goal_type", { enum: ["maintain", "lose", "gain"] }).notNull(),
  goalRateKgPerWeek: real("goal_rate_kg_per_week").notNull().default(0),
  kcalTargetMode: text("kcal_target_mode").default("auto"),
  macroStrategy: text("macro_strategy").default("protein_first"),
  validFrom: text("valid_from").notNull(), // ISO date
});

export const allergenExclusion = sqliteTable("allergen_exclusion", {
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  key: text("key").notNull(), // e.g. "gluten", "dairy"
});

export const trainingSession = sqliteTable("training_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO date
  sportType: text("sport_type").notNull(),
  startTime: text("start_time"), // HH:MM
  durationMin: integer("duration_min").notNull(),
  intensity: text("intensity", { enum: ["low", "moderate", "high", "very_high"] }).notNull(),
  fuellingPriority: text("fuelling_priority"),
});
