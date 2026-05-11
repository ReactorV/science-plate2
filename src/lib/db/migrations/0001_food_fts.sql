-- FTS5 virtual table for canonical food search
-- This is a custom SQL file because Drizzle-Kit does not support FTS5 virtual tables

CREATE VIRTUAL TABLE IF NOT EXISTS canonical_food_fts USING fts5(
  name,
  food_group,
  content='canonical_food',
  content_rowid='rowid'
);

-- Sync triggers: keep FTS5 in sync with canonical_food
CREATE TRIGGER IF NOT EXISTS canonical_food_ai AFTER INSERT ON canonical_food BEGIN
  INSERT INTO canonical_food_fts(rowid, name, food_group)
  VALUES (new.rowid, new.name, new.food_group);
END;

CREATE TRIGGER IF NOT EXISTS canonical_food_ad AFTER DELETE ON canonical_food BEGIN
  INSERT INTO canonical_food_fts(canonical_food_fts, rowid, name, food_group)
  VALUES ('delete', old.rowid, old.name, old.food_group);
END;

CREATE TRIGGER IF NOT EXISTS canonical_food_au AFTER UPDATE ON canonical_food BEGIN
  INSERT INTO canonical_food_fts(canonical_food_fts, rowid, name, food_group)
  VALUES ('delete', old.rowid, old.name, old.food_group);
  INSERT INTO canonical_food_fts(rowid, name, food_group)
  VALUES (new.rowid, new.name, new.food_group);
END;
