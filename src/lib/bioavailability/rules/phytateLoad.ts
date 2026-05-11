import type { Rule, DayInput, RuleResult } from "../types";

const LEGUME_GROUPS = new Set(["legume", "pulse", "whole_grain", "nut", "seed"]);
const IRON_THRESHOLD_UG = 3000; // 3 mg non-heme iron
const ZINC_THRESHOLD_UG = 3000; // 3 mg zinc (provisional; calibrate from EFSA DRV Phase 2)
const VITC_PROTECTIVE_UG = 25000; // 25 mg vit C negates phytate effect

/**
 * AC-15: High-phytate meals (legumes, whole grains, nuts/seeds) without
 * adequate vitamin C lower iron/zinc usability by one tier.
 */
export const phytateLoadRule: Rule = {
  id: "phytate-load",
  version: "1.0.0",
  evaluate(day: DayInput): RuleResult[] {
    const results: RuleResult[] = [];

    for (const meal of day.meals) {
      let ironUg = 0;
      let zincUg = 0;
      let vitCUg = 0;
      let hasHighPhytate = false;

      for (const item of meal.items) {
        ironUg += item.nutrients["iron"] ?? 0;
        zincUg += item.nutrients["zinc"] ?? 0;
        vitCUg += item.nutrients["vitamin_c"] ?? 0;

        if (item.foodGroup && LEGUME_GROUPS.has(item.foodGroup)) {
          hasHighPhytate = true;
        }
      }

      if (!hasHighPhytate) continue;
      if (ironUg < IRON_THRESHOLD_UG && zincUg < ZINC_THRESHOLD_UG) continue;
      if (vitCUg >= VITC_PROTECTIVE_UG) continue; // vit C negates

      const affected: string[] = [];
      if (ironUg >= IRON_THRESHOLD_UG) affected.push("iron");
      if (zincUg >= ZINC_THRESHOLD_UG) affected.push("zinc");

      results.push({
        ruleId: "phytate-load",
        ruleVersion: "1.0.0",
        evidenceRefs: ["Hurrell2003", "Gibson2010"],
        kind: "caution",
        affects: affected,
        humanReason: `High-phytate foods in this meal may reduce ${affected.join(" and ")} absorption. Adding vitamin C-rich foods can help.`,
        mealIndex: meal.index,
      });
    }

    return results;
  },
};
