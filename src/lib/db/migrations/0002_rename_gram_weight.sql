-- Rename gram_weight → weight_ug in portion_unit to match stored unit (µg, not grams).
-- Requires SQLite 3.25.0+ (libSQL supports this).
ALTER TABLE portion_unit RENAME COLUMN gram_weight TO weight_ug;
