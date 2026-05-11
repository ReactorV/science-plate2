import { describe, it, expect } from "vitest";
import { scoreAdequacy } from "./adequacy";
import type { NutrientIntake, ReferenceValueEntry } from "./adequacy";

describe("scoreAdequacy", () => {
  const ironRefs: ReferenceValueEntry[] = [
    { nutrientId: "iron", valueType: "PRI", amount: 16000 }, // 16 mg in µg
    { nutrientId: "iron", valueType: "UL", amount: 45000 }, // 45 mg
  ];

  it("iron at 17.4 mg vs RDA 16 returns pctRda ~108.75", () => {
    const intakes: NutrientIntake[] = [
      { nutrientId: "iron", foodOnly: 17400, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, ironRefs, "food_only");
    const iron = results.find((r) => r.nutrientId === "iron")!;
    expect(iron.pctRda).toBeCloseTo(108.75, 1);
    expect(iron.overUl).toBe(false);
    expect(iron.rdaType).toBe("PRI");
  });

  it("vit D 12 µg vs AI 15 returns pct_ai=80, type=AI", () => {
    const vitDRefs: ReferenceValueEntry[] = [
      { nutrientId: "vit_d", valueType: "AI", amount: 15 },
      { nutrientId: "vit_d", valueType: "UL", amount: 100 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "vit_d", foodOnly: 12, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, vitDRefs, "food_only");
    const vitD = results.find((r) => r.nutrientId === "vit_d")!;
    expect(vitD.pctRda).toBeCloseTo(80, 1);
    expect(vitD.rdaType).toBe("AI");
  });

  it("sodium > UL triggers overUl flag", () => {
    const sodiumRefs: ReferenceValueEntry[] = [
      { nutrientId: "sodium", valueType: "AI", amount: 2000000 },
      { nutrientId: "sodium", valueType: "UL", amount: 2300000 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "sodium", foodOnly: 2500000, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, sodiumRefs, "food_only");
    expect(results[0].overUl).toBe(true);
  });

  it("missing reference value returns null pctRda", () => {
    const intakes: NutrientIntake[] = [
      { nutrientId: "unknown_nutrient", foodOnly: 100, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, [], "food_only");
    expect(results[0].pctRda).toBeNull();
    expect(results[0].rda).toBeNull();
  });

  it("three-layer composition: food + supplements", () => {
    const intakes: NutrientIntake[] = [
      { nutrientId: "iron", foodOnly: 10000, supplementAmount: 5000, clinicianOverride: 2000 },
    ];

    const foodOnly = scoreAdequacy(intakes, ironRefs, "food_only");
    expect(foodOnly[0].intakeCanonical).toBe(10000);

    const withSupp = scoreAdequacy(intakes, ironRefs, "food_plus_supplements");
    expect(withSupp[0].intakeCanonical).toBe(15000);

    const withClinician = scoreAdequacy(
      intakes,
      ironRefs,
      "food_plus_supplements_plus_clinician_overrides",
    );
    expect(withClinician[0].intakeCanonical).toBe(17000);
  });

  it("AR is used when no PRI or AI is present", () => {
    const arRefs: ReferenceValueEntry[] = [
      { nutrientId: "zinc", valueType: "AR", amount: 7500 },
      { nutrientId: "zinc", valueType: "UL", amount: 25000 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "zinc", foodOnly: 10000, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, arRefs, "food_only");
    expect(results[0].rdaType).toBe("AR");
    expect(results[0].pctRda).toBeCloseTo((10000 / 7500) * 100, 1);
  });

  it("PRI wins over AI when both provided", () => {
    const refs: ReferenceValueEntry[] = [
      { nutrientId: "calcium", valueType: "AI", amount: 800000 },
      { nutrientId: "calcium", valueType: "PRI", amount: 950000 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "calcium", foodOnly: 900000, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, refs, "food_only");
    expect(results[0].rdaType).toBe("PRI");
    expect(results[0].rda).toBe(950000);
  });

  it("AI wins over AR when both provided", () => {
    const refs: ReferenceValueEntry[] = [
      { nutrientId: "potassium", valueType: "AR", amount: 2000000 },
      { nutrientId: "potassium", valueType: "AI", amount: 3500000 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "potassium", foodOnly: 3000000, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, refs, "food_only");
    expect(results[0].rdaType).toBe("AI");
  });

  it("UL-only nutrient has null rda but valid ul", () => {
    const refs: ReferenceValueEntry[] = [
      { nutrientId: "manganese", valueType: "UL", amount: 11000 },
    ];
    const intakes: NutrientIntake[] = [
      { nutrientId: "manganese", foodOnly: 5000, supplementAmount: 0, clinicianOverride: 0 },
    ];
    const results = scoreAdequacy(intakes, refs, "food_only");
    expect(results[0].rda).toBeNull();
    expect(results[0].ul).toBe(11000);
    expect(results[0].pctRda).toBeNull();
  });
});
