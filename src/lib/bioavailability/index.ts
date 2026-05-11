export type { Rule, RuleResult, DayInput, MealInput, MealItemInput, SupplementInput, RuleKind } from "./types";
export { evaluate, registerRule, clearRules, getRules, ensureRulesRegistered } from "./registry";
export { feVitCRule } from "./rules/feVitC";
export { teaIronRule } from "./rules/teaIron";
export { ironZincSuppRule } from "./rules/ironZincSupp";
export { calciumIronSuppRule } from "./rules/calciumIronSupp";
export { phytateLoadRule } from "./rules/phytateLoad";

import { ensureRulesRegistered } from "./registry";

/** @deprecated Use evaluate() which auto-registers. Kept for test beforeEach compatibility. */
export function registerAllRules(): void {
  ensureRulesRegistered();
}
