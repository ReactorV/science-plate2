import { describe, it, expect, beforeEach } from "vitest";
import { evaluate, clearRules, getRules, ensureRulesRegistered } from "./registry";
import { registerAllRules } from "./index";
import type { DayInput } from "./types";

const BUILTIN_RULE_IDS = ["fe-vitc", "tea-iron", "iron-zinc-supp", "calcium-iron-supp", "phytate-load"];
const emptyDay: DayInput = { meals: [], supplements: [] };

describe("registry", () => {
  beforeEach(() => {
    clearRules();
  });

  it("evaluate(emptyDay) returns []", () => {
    expect(evaluate(emptyDay)).toEqual([]);
  });

  describe("ensureRulesRegistered()", () => {
    it("registers all 5 built-in rules on first call", () => {
      ensureRulesRegistered();
      const ids = getRules().map((r) => r.id);
      expect(ids).toEqual(expect.arrayContaining(BUILTIN_RULE_IDS));
      expect(getRules()).toHaveLength(5);
    });

    it("is idempotent — calling twice does not double-register", () => {
      ensureRulesRegistered();
      ensureRulesRegistered();
      expect(getRules()).toHaveLength(5);
    });

    it("clearRules() resets the initialized flag so re-registration works", () => {
      ensureRulesRegistered();
      expect(getRules()).toHaveLength(5);
      clearRules();
      expect(getRules()).toHaveLength(0);
      ensureRulesRegistered();
      expect(getRules()).toHaveLength(5);
    });
  });

  describe("evaluate() auto-registration", () => {
    it("registers rules automatically without an explicit bootstrap call", () => {
      expect(getRules()).toHaveLength(0);
      evaluate(emptyDay);
      // Rules must now be registered as a side-effect of evaluate()
      expect(getRules()).toHaveLength(5);
    });

    it("returns results for a qualifying day without manual registerAllRules()", () => {
      const day: DayInput = {
        meals: [
          {
            index: 0,
            time: "08:00",
            items: [
              { foodId: "spinach", nutrients: { iron: 3000, vitamin_c: 60000 } },
            ],
          },
        ],
        supplements: [],
      };
      const results = evaluate(day);
      // fe-vitc rule must fire (3 mg Fe + 60 mg VitC)
      expect(results.some((r) => r.ruleId === "fe-vitc")).toBe(true);
    });
  });

  describe("registerAllRules() — deprecated compat shim", () => {
    it("delegates to ensureRulesRegistered and registers 5 rules", () => {
      registerAllRules();
      expect(getRules()).toHaveLength(5);
    });

    it("is idempotent via ensureRulesRegistered guard", () => {
      registerAllRules();
      registerAllRules();
      expect(getRules()).toHaveLength(5);
    });
  });
});
