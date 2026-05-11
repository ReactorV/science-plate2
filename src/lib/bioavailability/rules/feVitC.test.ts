import { describe, it, expect } from "vitest";
import { feVitCRule } from "./feVitC";
import type { DayInput } from "../types";

function day(ironUg: number, vitCUg: number): DayInput {
  return {
    meals: [{ index: 0, time: "08:00", items: [{ foodId: "food", nutrients: { iron: ironUg, vitamin_c: vitCUg } }] }],
    supplements: [],
  };
}

describe("feVitCRule", () => {
  it("AC-12: oats + kiwi + pumpkin seeds meal triggers synergy", () => {
    const d: DayInput = {
      meals: [
        {
          index: 0,
          time: "08:00",
          items: [
            {
              foodId: "oats",
              nutrients: { iron: 4500, vitamin_c: 0 }, // 4.5 mg iron, 0 vit C
            },
            {
              foodId: "kiwi",
              nutrients: { iron: 300, vitamin_c: 71000 }, // 71 mg vit C
            },
            {
              foodId: "pumpkin_seeds",
              nutrients: { iron: 2500, vitamin_c: 600 }, // 2.5 mg iron, 0.6 mg vit C
            },
          ],
        },
      ],
      supplements: [],
    };

    const results = feVitCRule.evaluate(d);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("synergy");
    expect(results[0].affects).toContain("iron");
    expect(results[0].strength).toBeGreaterThanOrEqual(0.5);
    expect(results[0].strength).toBeLessThanOrEqual(0.8);
    expect(results[0].mealIndex).toBe(0);
  });

  it("meal without vitamin C does not trigger synergy", () => {
    const results = feVitCRule.evaluate(day(5000, 0));
    expect(results).toHaveLength(0);
  });

  it("meal with low iron does not trigger", () => {
    // 0.5 mg Fe + 53 mg VitC — iron below 1 mg threshold
    const results = feVitCRule.evaluate(day(500, 53000));
    expect(results).toHaveLength(0);
  });

  it("high vit C ratio yields higher strength", () => {
    const results = feVitCRule.evaluate(day(3000, 100000)); // ratio ~33
    expect(results[0].strength).toBeCloseTo(0.8, 1); // capped at 0.8
  });

  describe("AC-12 threshold boundary conditions (1 mg Fe / 30 mg VitC)", () => {
    it("exactly 1 mg Fe + 30 mg VitC triggers synergy (at-threshold)", () => {
      const results = feVitCRule.evaluate(day(1000, 30000));
      expect(results).toHaveLength(1);
      expect(results[0].kind).toBe("synergy");
    });

    it("999 µg Fe (< 1 mg) + 30 mg VitC does NOT trigger", () => {
      const results = feVitCRule.evaluate(day(999, 30000));
      expect(results).toHaveLength(0);
    });

    it("1 mg Fe + 29 999 µg VitC (< 30 mg) does NOT trigger", () => {
      const results = feVitCRule.evaluate(day(1000, 29999));
      expect(results).toHaveLength(0);
    });

    it("1 mg Fe + 30 mg VitC → strength at lower bound (ratio = 30, clamped to 0.8)", () => {
      const results = feVitCRule.evaluate(day(1000, 30000));
      // ratio = 30 mg / 1 mg = 30 → well above 20, capped at 0.8
      expect(results[0].strength).toBeCloseTo(0.8, 5);
    });
  });
});
