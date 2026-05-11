import { describe, it, expect } from "vitest";
import { phytateLoadRule } from "./phytateLoad";
import type { DayInput } from "../types";

describe("phytateLoadRule", () => {
  it("AC-15: large legume meal without vit C → caution for iron", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            {
              foodId: "lentils",
              foodGroup: "legume",
              nutrients: { iron: 6000, zinc: 2500, vitamin_c: 1500 },
            },
            {
              foodId: "rice",
              foodGroup: "whole_grain",
              nutrients: { iron: 1000, zinc: 1000, vitamin_c: 0 },
            },
          ],
        },
      ],
      supplements: [],
    };

    const results = phytateLoadRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("caution");
    expect(results[0].affects).toContain("iron");
    expect(results[0].mealIndex).toBe(0);
  });

  it("AC-15: adding kiwi (vit C) removes the caution", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            {
              foodId: "lentils",
              foodGroup: "legume",
              nutrients: { iron: 6000, zinc: 2500, vitamin_c: 1500 },
            },
            {
              foodId: "rice",
              foodGroup: "whole_grain",
              nutrients: { iron: 1000, zinc: 1000, vitamin_c: 0 },
            },
            {
              foodId: "kiwi",
              nutrients: { iron: 300, vitamin_c: 71000 }, // 71 mg vit C > 25 mg threshold
            },
          ],
        },
      ],
      supplements: [],
    };

    expect(phytateLoadRule.evaluate(day)).toHaveLength(0);
  });

  it("non-phytate foods do not trigger", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            {
              foodId: "chicken",
              foodGroup: "poultry",
              nutrients: { iron: 3500, vitamin_c: 0 },
            },
          ],
        },
      ],
      supplements: [],
    };

    expect(phytateLoadRule.evaluate(day)).toHaveLength(0);
  });

  it("low iron/zinc in phytate meal does not trigger", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            {
              foodId: "hummus",
              foodGroup: "legume",
              nutrients: { iron: 1000, zinc: 500, vitamin_c: 0 },
            },
          ],
        },
      ],
      supplements: [],
    };

    expect(phytateLoadRule.evaluate(day)).toHaveLength(0);
  });
});
