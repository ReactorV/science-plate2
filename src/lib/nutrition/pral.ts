/**
 * PRAL (Potential Renal Acid Load) via Remer–Manz formula.
 * Formula: 0.49 × protein(g) + 0.037 × P(mg) − 0.021 × K(mg) − 0.026 × Mg(mg) − 0.013 × Ca(mg)
 * Result in mEq/day. Negative = alkaline, positive = acidic.
 */

export interface PralInput {
  proteinG: number;
  phosphorusMg: number;
  potassiumMg: number;
  magnesiumMg: number;
  calciumMg: number;
}

export function pralFromTotals(input: PralInput): number {
  return (
    0.49 * input.proteinG +
    0.037 * input.phosphorusMg -
    0.021 * input.potassiumMg -
    0.026 * input.magnesiumMg -
    0.013 * input.calciumMg
  );
}

export interface MealNutrients {
  proteinG: number;
  phosphorusMg: number;
  potassiumMg: number;
  magnesiumMg: number;
  calciumMg: number;
}

export function pralByMeal(meals: MealNutrients[]): number[] {
  return meals.map((m) => pralFromTotals(m));
}
