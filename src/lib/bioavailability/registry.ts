import type { Rule, RuleResult, DayInput } from "./types";
import { feVitCRule } from "./rules/feVitC";
import { teaIronRule } from "./rules/teaIron";
import { ironZincSuppRule } from "./rules/ironZincSupp";
import { calciumIronSuppRule } from "./rules/calciumIronSupp";
import { phytateLoadRule } from "./rules/phytateLoad";

const rules: Rule[] = [];
let initialized = false;

export function registerRule(rule: Rule): void {
  rules.push(rule);
}

/**
 * Lazy-init guard — safe to call multiple times.
 * Registers all built-in rules exactly once per process lifetime.
 * Called automatically by evaluate() so production paths work
 * without an explicit bootstrap call.
 */
export function ensureRulesRegistered(): void {
  if (initialized) return;
  initialized = true;
  registerRule(feVitCRule);
  registerRule(teaIronRule);
  registerRule(ironZincSuppRule);
  registerRule(calciumIronSuppRule);
  registerRule(phytateLoadRule);
}

export function evaluate(day: DayInput): RuleResult[] {
  ensureRulesRegistered();
  const results: RuleResult[] = [];
  for (const rule of rules) {
    results.push(...rule.evaluate(day));
  }
  return results;
}

export function clearRules(): void {
  rules.length = 0;
  initialized = false;
}

export function getRules(): readonly Rule[] {
  return rules;
}
