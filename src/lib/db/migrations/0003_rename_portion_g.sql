-- Rename portion_g → portion_ug to match stored sub-unit (µg, not grams).
-- See: schema/plan.ts portionUg — same fix applied to gramWeight in migration 0002.
ALTER TABLE meal_item RENAME COLUMN portion_g TO portion_ug;
