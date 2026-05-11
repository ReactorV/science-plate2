import { describe, it, expect } from "vitest";
import { teaIronRule } from "./teaIron";
import type { DayInput } from "../types";

describe("teaIronRule", () => {
  it("AC-13: tea + dark choc snack near iron meal triggers caution", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            { foodId: "lentils", nutrients: { iron: 6000 } }, // 6 mg iron
          ],
        },
        {
          index: 1,
          time: "12:30",
          items: [
            { foodId: "tea", nutrients: {} },
            { foodId: "dark_chocolate", nutrients: { iron: 1000 } },
          ],
        },
      ],
      supplements: [],
    };

    const results = teaIronRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("caution");
    expect(results[0].affects).toContain("iron");
    expect(results[0].mealIndex).toBe(1);
  });

  it("moving snack to 23:00 removes the caution", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [{ foodId: "lentils", nutrients: { iron: 6000 } }],
        },
        {
          index: 1,
          time: "23:00",
          items: [
            { foodId: "tea", nutrients: {} },
            { foodId: "dark_chocolate", nutrients: { iron: 1000 } },
          ],
        },
      ],
      supplements: [],
    };

    expect(teaIronRule.evaluate(day)).toHaveLength(0);
  });

  it("no tannin foods → no caution", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [{ foodId: "steak", nutrients: { iron: 5000 } }],
        },
      ],
      supplements: [],
    };

    expect(teaIronRule.evaluate(day)).toHaveLength(0);
  });

  it("tannin food in same meal as iron triggers caution", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "12:00",
          items: [
            { foodId: "lentils", nutrients: { iron: 4000 } },
            { foodId: "coffee", nutrients: {} },
          ],
        },
      ],
      supplements: [],
    };

    const results = teaIronRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("caution");
  });

  it("EC-3: tea at 23:55 is within window of iron meal at 00:05 (midnight-crossing)", () => {
    const day: DayInput = {
      meals: [
        {
          index: 0,
          time: "00:05",
          items: [{ foodId: "lentils", nutrients: { iron: 6000 } }],
        },
        {
          index: 1,
          time: "23:55",
          items: [
            { foodId: "tea", nutrients: {} },
          ],
        },
      ],
      supplements: [],
    };

    const results = teaIronRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("caution");
  });
});
