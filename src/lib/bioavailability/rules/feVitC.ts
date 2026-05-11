import type { Rule, DayInput, RuleResult } from "../types";

// Iron in µg, Vitamin C in µg. Thresholds in mg for readability.
const IRON_THRESHOLD_UG = 1000; // 1 mg non-heme iron per AC-12
const VITC_THRESHOLD_UG = 30000; // 30 mg vitamin C per AC-12

/**
 * AC-12: Fe + vitamin C synergy.
 * When a meal contains ≥ 1 mg non-heme iron AND ≥ 30 mg vitamin C,
 * iron absorption is enhanced. Strength scales with vitC:iron ratio (capped at 0.8).
 */
export const feVitCRule: Rule = {
  id: "fe-vitc",
  version: "1.0.0",
  evaluate(day: DayInput): RuleResult[] {
    const results: RuleResult[] = [];

    for (const meal of day.meals) {
      let ironUg = 0;
      let vitCUg = 0;

      for (const item of meal.items) {
        ironUg += item.nutrients["iron"] ?? 0;
        vitCUg += item.nutrients["vitamin_c"] ?? 0;
      }

      if (ironUg >= IRON_THRESHOLD_UG && vitCUg >= VITC_THRESHOLD_UG) {
        const ironMg = ironUg / 1000;
        const vitCMg = vitCUg / 1000;
        const ratio = vitCMg / ironMg;
        // Strength: linear from 0.5 at ratio=5 to 0.8 at ratio≥20
        const strength = Math.min(0.8, Math.max(0.5, 0.5 + (ratio - 5) * (0.3 / 15)));

        results.push({
          ruleId: "fe-vitc",
          ruleVersion: "1.0.0",
          evidenceRefs: ["Hallberg1989", "Cook2001"],
          kind: "synergy",
          affects: ["iron"],
          humanReason: `Vitamin C (${vitCMg.toFixed(0)} mg) enhances non-heme iron (${ironMg.toFixed(1)} mg) absorption in this meal.`,
          mealIndex: meal.index,
          strength,
        });
      }
    }

    return results;
  },
};
