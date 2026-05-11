import { describe, it, expect } from "vitest";
import { calciumIronSuppRule } from "./calciumIronSupp";
import type { DayInput } from "../types";

describe("calciumIronSuppRule", () => {
  it("calcium 500mg at 08:00 + iron at 09:00 → caution", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "calcium", amountCanonical: 500000, time: "08:00" },
        { nutrientId: "iron", amountCanonical: 18000, time: "09:00" },
      ],
    };

    const results = calciumIronSuppRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("caution");
    expect(results[0].affects).toContain("iron");
  });

  it("calcium 100mg (below threshold) does not trigger", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "calcium", amountCanonical: 100000, time: "08:00" },
        { nutrientId: "iron", amountCanonical: 18000, time: "08:30" },
      ],
    };

    expect(calciumIronSuppRule.evaluate(day)).toHaveLength(0);
  });

  it("calcium + iron > 2h apart does not trigger", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "calcium", amountCanonical: 500000, time: "08:00" },
        { nutrientId: "iron", amountCanonical: 18000, time: "20:00" },
      ],
    };

    expect(calciumIronSuppRule.evaluate(day)).toHaveLength(0);
  });
});
