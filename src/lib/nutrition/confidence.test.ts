import { describe, it, expect } from "vitest";
import { dayConfidence } from "./confidence";
import type { ConfidenceItem } from "./confidence";

describe("dayConfidence", () => {
  it("AC-11: prototype seed day yields 0.84 ± 0.02", () => {
    // Realistic seed day: mix of analytical, branded, calculated, user-entered
    const items: ConfidenceItem[] = [
      // Breakfast: oats (analytical), milk (branded), banana (analytical)
      { provenanceTier: "analytical", kcalContribution: 230 },
      { provenanceTier: "branded", kcalContribution: 120 },
      { provenanceTier: "analytical", kcalContribution: 105 },
      // Lunch: chicken salad (user-entered), bread (branded), apple (analytical)
      { provenanceTier: "user", kcalContribution: 150 },
      { provenanceTier: "branded", kcalContribution: 130 },
      { provenanceTier: "analytical", kcalContribution: 95 },
      // Snack: protein bar (branded)
      { provenanceTier: "branded", kcalContribution: 200 },
      // Dinner: lentil curry (calculated), rice (analytical)
      { provenanceTier: "calculated", kcalContribution: 400 },
      { provenanceTier: "analytical", kcalContribution: 200 },
      // Evening: tea (analytical)
      { provenanceTier: "analytical", kcalContribution: 5 },
    ];
    const confidence = dayConfidence(items);
    expect(confidence).toBeGreaterThanOrEqual(0.82);
    expect(confidence).toBeLessThanOrEqual(0.86);
  });

  it("all analytical items yield 1.0", () => {
    const items: ConfidenceItem[] = [
      { provenanceTier: "analytical", kcalContribution: 500 },
      { provenanceTier: "analytical", kcalContribution: 300 },
    ];
    expect(dayConfidence(items)).toBe(1.0);
  });

  it("empty items return 0", () => {
    expect(dayConfidence([])).toBe(0);
  });

  it("single photo item yields 0.4", () => {
    expect(dayConfidence([{ provenanceTier: "photo", kcalContribution: 100 }])).toBe(0.4);
  });

  it("weights by kcal contribution", () => {
    const items: ConfidenceItem[] = [
      { provenanceTier: "analytical", kcalContribution: 900 }, // 1.0
      { provenanceTier: "photo", kcalContribution: 100 }, // 0.4
    ];
    // weighted: (1.0*900 + 0.4*100) / 1000 = 940/1000 = 0.94
    expect(dayConfidence(items)).toBeCloseTo(0.94, 2);
  });
});
