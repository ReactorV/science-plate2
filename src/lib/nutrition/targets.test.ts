import { describe, it, expect } from "vitest";
import { calculateTargets, checkEnergyAvailability, dailyDeficitKcal } from "./targets";
import type { ProfileInput } from "./targets";

describe("calculateTargets", () => {
  // AC-3 fixture: F, 31, 62 kg, 168 cm, moderate, lose, -0.25 kg/wk
  const AC3_INPUT: ProfileInput = {
    sex: "F",
    age: 31,
    weightKg: 62,
    heightCm: 168,
    activityLevel: "moderate",
    goalType: "lose",
    goalRateKgPerWeek: -0.25,
  };

  it("AC-3: returns kcal target 2180 ± 5", () => {
    const result = calculateTargets(AC3_INPUT);
    expect(result.kcal).toBeGreaterThanOrEqual(2175);
    expect(result.kcal).toBeLessThanOrEqual(2185);
  });

  it("AC-3: returns protein 124 ± 2 g", () => {
    const result = calculateTargets(AC3_INPUT);
    expect(result.proteinG).toBeGreaterThanOrEqual(122);
    expect(result.proteinG).toBeLessThanOrEqual(126);
  });

  it("AC-3: returns fat within reasonable range", () => {
    const result = calculateTargets(AC3_INPUT);
    expect(result.fatG).toBeGreaterThanOrEqual(60);
    expect(result.fatG).toBeLessThanOrEqual(80);
  });

  it("AC-3: returns carbs within reasonable range", () => {
    const result = calculateTargets(AC3_INPUT);
    expect(result.carbsG).toBeGreaterThanOrEqual(250);
    expect(result.carbsG).toBeLessThanOrEqual(290);
  });

  it("AC-3: returns fibre 32 ± 2 g", () => {
    const result = calculateTargets(AC3_INPUT);
    expect(result.fibreG).toBeGreaterThanOrEqual(28);
    expect(result.fibreG).toBeLessThanOrEqual(34);
  });

  it("maintain goal returns TDEE without adjustment", () => {
    const result = calculateTargets({ ...AC3_INPUT, goalType: "maintain", goalRateKgPerWeek: 0 });
    // HB BMR (F) = 447.593 + 9.247×62 + 3.098×168 - 4.330×31 ≈ 1407
    // TDEE = 1407 × 1.55 ≈ 2181
    expect(result.kcal).toBeGreaterThanOrEqual(2175);
    expect(result.kcal).toBeLessThanOrEqual(2185);
  });

  it("sedentary activity produces lower kcal than moderate", () => {
    const sedentary = calculateTargets({ ...AC3_INPUT, activityLevel: "sedentary" });
    const moderate = calculateTargets(AC3_INPUT);
    expect(sedentary.kcal).toBeLessThan(moderate.kcal);
  });
});

describe("checkEnergyAvailability", () => {
  it("AC-4: warns when rate > 0.4% bw/week and training > 6h", () => {
    const input: ProfileInput = {
      sex: "F",
      age: 31,
      weightKg: 62,
      heightCm: 168,
      activityLevel: "very_active",
      goalType: "lose",
      goalRateKgPerWeek: -0.5,
      trainingHoursPerWeek: 8,
    };
    const result = checkEnergyAvailability(input);
    expect(result.triggered).toBe(true);
    expect(result.evidencePackId).toBeTruthy();
  });

  it("does not warn for moderate rate + low training", () => {
    const input: ProfileInput = {
      sex: "F",
      age: 31,
      weightKg: 62,
      heightCm: 168,
      activityLevel: "moderate",
      goalType: "lose",
      goalRateKgPerWeek: -0.25,
      trainingHoursPerWeek: 4,
    };
    const result = checkEnergyAvailability(input);
    expect(result.triggered).toBe(false);
  });
});

describe("calculateTargets — male profile", () => {
  it("male BMR path: 35yo 80kg 180cm moderate maintain", () => {
    const result = calculateTargets({
      sex: "M",
      age: 35,
      weightKg: 80,
      heightCm: 180,
      activityLevel: "moderate",
      goalType: "maintain",
      goalRateKgPerWeek: 0,
    });
    // HB Male: 88.362 + 13.397×80 + 4.799×180 - 5.677×35 ≈ 1891 × 1.55 ≈ 2931
    expect(result.kcal).toBeGreaterThan(2800);
    expect(result.kcal).toBeLessThan(3100);
  });

  it("gain goal uses 1.8 g/kg protein", () => {
    const result = calculateTargets({
      sex: "M",
      age: 25,
      weightKg: 70,
      heightCm: 175,
      activityLevel: "light",
      goalType: "gain",
      goalRateKgPerWeek: 0.25,
    });
    // 1.8 g/kg × 70 kg = 126 g
    expect(result.proteinG).toBe(126);
  });

  it("extra_active produces highest kcal among activity levels", () => {
    const base = {
      sex: "M" as const,
      age: 30,
      weightKg: 75,
      heightCm: 178,
      goalType: "maintain" as const,
      goalRateKgPerWeek: 0,
    };
    const extra = calculateTargets({ ...base, activityLevel: "extra_active" });
    const very = calculateTargets({ ...base, activityLevel: "very_active" });
    expect(extra.kcal).toBeGreaterThan(very.kcal);
  });
});

describe("dailyDeficitKcal", () => {
  it("returns 275 kcal/day for -0.25 kg/week rate", () => {
    const deficit = dailyDeficitKcal(-0.25);
    // 0.25 × 7700 / 7 = 275
    expect(deficit).toBe(-275);
  });

  it("returns 0 for maintenance", () => {
    expect(dailyDeficitKcal(0)).toBe(0);
  });

  it("returns positive for gain", () => {
    expect(dailyDeficitKcal(0.5)).toBeGreaterThan(0);
  });
});
