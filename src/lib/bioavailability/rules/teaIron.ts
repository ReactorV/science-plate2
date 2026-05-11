import type { Rule, DayInput, RuleResult } from "../types";

const IRON_THRESHOLD_UG = 3000; // 3 mg iron
const TIME_WINDOW_MIN = 60;

const TANNIN_FOODS = new Set(["tea", "coffee", "cocoa", "dark_chocolate", "green_tea", "black_tea"]);

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function withinWindow(t1: string, t2: string, windowMin: number): boolean {
  const a = parseTimeMinutes(t1);
  const b = parseTimeMinutes(t2);
  const diff = Math.abs(a - b);
  // Wrap around midnight: e.g. 23:55 and 00:05 are 10 min apart, not 1430 min
  return Math.min(diff, 1440 - diff) <= windowMin;
}

/**
 * AC-13: Tannin-containing beverages/foods near iron-heavy meals reduce absorption.
 * Triggers when a meal containing tea/coffee/cocoa is within ±60 min of an iron-heavy meal (≥3 mg).
 */
export const teaIronRule: Rule = {
  id: "tea-iron",
  version: "1.0.0",
  evaluate(day: DayInput): RuleResult[] {
    const results: RuleResult[] = [];

    const ironMeals: { index: number; time: string; ironUg: number }[] = [];
    const tanninMeals: { index: number; time: string }[] = [];

    for (const meal of day.meals) {
      let mealIronUg = 0;
      let hasTannin = false;

      for (const item of meal.items) {
        mealIronUg += item.nutrients["iron"] ?? 0;
        if (TANNIN_FOODS.has(item.foodId) || item.foodGroup === "tannin_beverage") {
          hasTannin = true;
        }
      }

      if (mealIronUg >= IRON_THRESHOLD_UG) {
        ironMeals.push({ index: meal.index, time: meal.time, ironUg: mealIronUg });
      }
      if (hasTannin) {
        tanninMeals.push({ index: meal.index, time: meal.time });
      }
    }

    for (const tannin of tanninMeals) {
      for (const iron of ironMeals) {
        if (tannin.index === iron.index || withinWindow(tannin.time, iron.time, TIME_WINDOW_MIN)) {
          const alreadyReported = results.some(
            (r) => r.mealIndex === tannin.index && r.ruleId === "tea-iron",
          );
          if (!alreadyReported) {
            results.push({
              ruleId: "tea-iron",
              ruleVersion: "1.0.0",
              evidenceRefs: ["Hurrell1999", "Zijp2000"],
              kind: "caution",
              affects: ["iron"],
              humanReason: `Tannins in this meal/snack may reduce iron absorption from a nearby iron-rich meal (${(iron.ironUg / 1000).toFixed(1)} mg Fe).`,
              mealIndex: tannin.index,
            });
          }
        }
      }
    }

    return results;
  },
};
