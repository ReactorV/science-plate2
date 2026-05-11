import { describe, it, expect } from "vitest";

// Test the FDC nutrient mapping logic extracted from ingest-fdc.ts
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
  1103: "selenium",
  1162: "vitamin_c",
};

const UNIT_CONVERTERS: Record<string, (val: number) => number> = {
  energy: (kcal) => Math.round(kcal * 10),
  protein: (g) => Math.round(g * 1_000_000),
  total_fat: (g) => Math.round(g * 1_000_000),
  carbohydrate: (g) => Math.round(g * 1_000_000),
  fibre: (g) => Math.round(g * 1_000_000),
  calcium: (mg) => Math.round(mg * 1_000),
  iron: (mg) => Math.round(mg * 1_000),
  magnesium: (mg) => Math.round(mg * 1_000),
  phosphorus: (mg) => Math.round(mg * 1_000),
  potassium: (mg) => Math.round(mg * 1_000),
  sodium: (mg) => Math.round(mg * 1_000),
  zinc: (mg) => Math.round(mg * 1_000),
  selenium: (ug) => Math.round(ug),
  vitamin_c: (mg) => Math.round(mg * 1_000),
};

describe("FDC nutrient mapping", () => {
  it("maps FDC energy (kcal) to canonical kcal×10", () => {
    const fdcNutrientId = 1008;
    const key = FDC_NUTRIENT_MAP[fdcNutrientId]!;
    expect(key).toBe("energy");
    expect(UNIT_CONVERTERS[key](250)).toBe(2500); // 250 kcal → 2500
  });

  it("maps FDC protein (g) to canonical µg", () => {
    const key = FDC_NUTRIENT_MAP[1003]!;
    expect(key).toBe("protein");
    expect(UNIT_CONVERTERS[key](25.5)).toBe(25_500_000); // 25.5g → 25,500,000 µg
  });

  it("maps FDC iron (mg) to canonical µg", () => {
    const key = FDC_NUTRIENT_MAP[1089]!;
    expect(key).toBe("iron");
    expect(UNIT_CONVERTERS[key](3.2)).toBe(3200); // 3.2mg → 3200 µg
  });

  it("maps FDC selenium (µg) to canonical µg (no conversion)", () => {
    const key = FDC_NUTRIENT_MAP[1103]!;
    expect(key).toBe("selenium");
    expect(UNIT_CONVERTERS[key](55)).toBe(55);
  });

  it("maps FDC calcium (mg) to canonical µg", () => {
    const key = FDC_NUTRIENT_MAP[1087]!;
    expect(key).toBe("calcium");
    expect(UNIT_CONVERTERS[key](120)).toBe(120_000);
  });

  it("unmapped FDC nutrient returns undefined", () => {
    expect(FDC_NUTRIENT_MAP[9999]).toBeUndefined();
  });

  it("handles zero amounts correctly", () => {
    expect(UNIT_CONVERTERS["iron"](0)).toBe(0);
    expect(UNIT_CONVERTERS["energy"](0)).toBe(0);
  });

  it("all mapped nutrients have converters", () => {
    for (const [fdcId, key] of Object.entries(FDC_NUTRIENT_MAP)) {
      expect(UNIT_CONVERTERS[key], `Missing converter for FDC ${fdcId} → ${key}`).toBeDefined();
    }
  });
});
