export type Sex = "M" | "F";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "extra_active";
export type GoalType = "maintain" | "lose" | "gain";

export interface ProfileInput {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalRateKgPerWeek: number; // -1.0 to +0.5
  trainingHoursPerWeek?: number;
}

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fibreG: number;
}

export interface EnergyAvailabilityWarning {
  triggered: boolean;
  message: string;
  evidencePackId: string;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const KCAL_PER_KG = 7700;
const FIBRE_G_PER_1000_KCAL = 14;
const FIBRE_KCAL_PER_G = 2;
const FAT_PCT_OF_KCAL = 0.3;

/**
 * Revised Harris-Benedict BMR.
 * Matches the prototype seed data (AC-3).
 * M: 88.362 + 13.397w + 4.799h − 5.677a
 * F: 447.593 + 9.247w + 3.098h − 4.330a
 */
function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  if (sex === "M") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

function proteinTarget(weightKg: number, goalType: GoalType): number {
  const gPerKg = goalType === "lose" ? 2.0 : goalType === "gain" ? 1.8 : 1.6;
  return Math.round(weightKg * gPerKg);
}

export function calculateTargets(input: ProfileInput): MacroTargets {
  const baseBmr = bmr(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = baseBmr * ACTIVITY_FACTORS[input.activityLevel];
  const kcal = Math.round(tdee);

  const protein = proteinTarget(input.weightKg, input.goalType);
  const fat = Math.round((kcal * FAT_PCT_OF_KCAL) / 9);
  const fibre = Math.round((kcal / 1000) * FIBRE_G_PER_1000_KCAL);

  // Carbs fill remainder, accounting for fibre at 2 kcal/g instead of 4
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const fibreKcal = fibre * FIBRE_KCAL_PER_G;
  const remainingKcal = kcal - proteinKcal - fatKcal;
  const nonFibreCarbs = Math.round((remainingKcal - fibreKcal) / 4);
  const carbs = nonFibreCarbs + fibre;

  return { kcal, proteinG: protein, fatG: fat, carbsG: carbs, fibreG: fibre };
}

/**
 * kcal deficit implied by the goal rate, for use in energy-availability checks.
 */
export function dailyDeficitKcal(goalRateKgPerWeek: number): number {
  return Math.round((goalRateKgPerWeek * KCAL_PER_KG) / 7);
}

export function checkEnergyAvailability(input: ProfileInput): EnergyAvailabilityWarning {
  const trainingHours = input.trainingHoursPerWeek ?? 0;
  const goalRate = Math.abs(input.goalRateKgPerWeek);
  const bwPctPerWeek = (goalRate / input.weightKg) * 100;

  if (bwPctPerWeek > 0.4 && trainingHours > 6) {
    return {
      triggered: true,
      message:
        "Rate may risk low energy availability. Consider a smaller deficit or consulting a sports dietitian.",
      evidencePackId: "EA-WARNING-V1",
    };
  }

  return { triggered: false, message: "", evidencePackId: "" };
}
