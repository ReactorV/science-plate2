export type RuleKind = "synergy" | "caution" | "warning";

export interface RuleResult {
  ruleId: string;
  ruleVersion: string;
  evidenceRefs: string[];
  kind: RuleKind;
  affects: string[];
  humanReason: string;
  mealIndex?: number;
  strength?: number; // 0–1, optional for synergy magnitude
}

export interface MealInput {
  index: number;
  time: string; // HH:mm
  items: MealItemInput[];
}

export interface MealItemInput {
  foodId: string;
  foodGroup?: string;
  nutrients: Record<string, number>; // nutrientId → amount in canonical sub-unit
}

export interface SupplementInput {
  nutrientId: string;
  amountCanonical: number;
  time: string; // HH:mm
}

export interface DayInput {
  meals: MealInput[];
  supplements: SupplementInput[];
}

export interface Rule {
  id: string;
  version: string;
  evaluate(day: DayInput): RuleResult[];
}
