import type { Rule, DayInput, RuleResult } from "../types";

const IRON_THRESHOLD_UG = 25000; // 25 mg elemental iron
const TIME_WINDOW_MIN = 60;

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * AC-14: High-dose iron supplement + zinc supplement timing conflict.
 * Triggers when iron supplement ≥ 25 mg is taken within ±60 min of any zinc supplement.
 */
export const ironZincSuppRule: Rule = {
  id: "iron-zinc-supp",
  version: "1.0.0",
  evaluate(day: DayInput): RuleResult[] {
    const results: RuleResult[] = [];

    const ironSupps = day.supplements.filter(
      (s) => s.nutrientId === "iron" && s.amountCanonical >= IRON_THRESHOLD_UG,
    );
    const zincSupps = day.supplements.filter((s) => s.nutrientId === "zinc");

    for (const iron of ironSupps) {
      const ironMin = parseTimeMinutes(iron.time);
      for (const zinc of zincSupps) {
        const zincMin = parseTimeMinutes(zinc.time);
        if (Math.abs(ironMin - zincMin) <= TIME_WINDOW_MIN) {
          results.push({
            ruleId: "iron-zinc-supp",
            ruleVersion: "1.0.0",
            evidenceRefs: ["Whittaker1998", "Solomons1986"],
            kind: "warning",
            affects: ["iron", "zinc"],
            humanReason: `High-dose iron (${(iron.amountCanonical / 1000).toFixed(0)} mg) taken within 60 min of zinc supplement may reduce absorption of both minerals.`,
          });
          return results; // one warning per day is sufficient
        }
      }
    }

    return results;
  },
};
