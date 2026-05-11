import type { Rule, DayInput, RuleResult } from "../types";

const CALCIUM_THRESHOLD_UG = 200000; // 200 mg
const TIME_WINDOW_MIN = 120; // 2 hours

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Calcium supplement ≥ 200 mg within ±2h of iron supplement reduces iron absorption.
 */
export const calciumIronSuppRule: Rule = {
  id: "calcium-iron-supp",
  version: "1.0.0",
  evaluate(day: DayInput): RuleResult[] {
    const results: RuleResult[] = [];

    const calciumSupps = day.supplements.filter(
      (s) => s.nutrientId === "calcium" && s.amountCanonical >= CALCIUM_THRESHOLD_UG,
    );
    const ironSupps = day.supplements.filter((s) => s.nutrientId === "iron");

    for (const calcium of calciumSupps) {
      const caMin = parseTimeMinutes(calcium.time);
      for (const iron of ironSupps) {
        const feMin = parseTimeMinutes(iron.time);
        if (Math.abs(caMin - feMin) <= TIME_WINDOW_MIN) {
          results.push({
            ruleId: "calcium-iron-supp",
            ruleVersion: "1.0.0",
            evidenceRefs: ["Hallberg1991", "Roughead2005"],
            kind: "caution",
            affects: ["iron"],
            humanReason: `Calcium supplement (${(calcium.amountCanonical / 1000).toFixed(0)} mg) within 2 hours of iron supplement may inhibit iron absorption.`,
          });
          return results;
        }
      }
    }

    return results;
  },
};
