import { describe, it, expect } from "vitest";
import { ironZincSuppRule } from "./ironZincSupp";
import type { DayInput } from "../types";

describe("ironZincSuppRule", () => {
  it("AC-14: iron 30mg at 08:00 + zinc at 08:30 → warning", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "iron", amountCanonical: 30000, time: "08:00" },
        { nutrientId: "zinc", amountCanonical: 15000, time: "08:30" },
      ],
    };

    const results = ironZincSuppRule.evaluate(day);
    expect(results).toHaveLength(1);
    expect(results[0].kind).toBe("warning");
    expect(results[0].affects).toEqual(expect.arrayContaining(["iron", "zinc"]));
  });

  it("iron 20mg (below threshold) does not trigger", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "iron", amountCanonical: 20000, time: "08:00" },
        { nutrientId: "zinc", amountCanonical: 15000, time: "08:30" },
      ],
    };

    expect(ironZincSuppRule.evaluate(day)).toHaveLength(0);
  });

  it("iron + zinc > 60 min apart does not trigger", () => {
    const day: DayInput = {
      meals: [],
      supplements: [
        { nutrientId: "iron", amountCanonical: 30000, time: "08:00" },
        { nutrientId: "zinc", amountCanonical: 15000, time: "20:00" },
      ],
    };

    expect(ironZincSuppRule.evaluate(day)).toHaveLength(0);
  });
});
