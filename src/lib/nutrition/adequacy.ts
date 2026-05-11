export type ValueType = "AR" | "PRI" | "AI" | "UL";

export interface ReferenceValueEntry {
  nutrientId: string;
  valueType: ValueType;
  amount: number; // canonical sub-unit
}

export interface NutrientIntake {
  nutrientId: string;
  foodOnly: number; // canonical sub-unit
  supplementAmount: number; // canonical sub-unit
  clinicianOverride: number; // canonical sub-unit
}

export interface AdequacyResult {
  nutrientId: string;
  intakeCanonical: number;
  rda: number | null;
  rdaType: ValueType | null; // "PRI" or "AI" — tells the UI which label
  ul: number | null;
  pctRda: number | null;
  overUl: boolean;
  confidenceBand: "high" | "medium" | "low";
  layer: "food_only" | "food_plus_supplements" | "food_plus_supplements_plus_clinician_overrides";
}

export function scoreAdequacy(
  intakes: NutrientIntake[],
  referenceValues: ReferenceValueEntry[],
  layer: AdequacyResult["layer"] = "food_only",
): AdequacyResult[] {
  const refMap = new Map<string, { rda: number | null; rdaType: ValueType | null; ul: number | null }>();

  for (const rv of referenceValues) {
    const existing = refMap.get(rv.nutrientId) ?? { rda: null, rdaType: null, ul: null };
    if (rv.valueType === "UL") {
      existing.ul = rv.amount;
    } else {
      // PRI > AI > AR in precedence for the "RDA" display value
      if (existing.rdaType === null || precedence(rv.valueType) > precedence(existing.rdaType)) {
        existing.rda = rv.amount;
        existing.rdaType = rv.valueType;
      }
    }
    refMap.set(rv.nutrientId, existing);
  }

  return intakes.map((intake) => {
    const totalIntake = resolveIntakeForLayer(intake, layer);
    const ref = refMap.get(intake.nutrientId);

    const rda = ref?.rda ?? null;
    const rdaType = ref?.rdaType ?? null;
    const ul = ref?.ul ?? null;
    const pctRda = rda !== null && rda > 0 ? (totalIntake / rda) * 100 : null;
    const overUl = ul !== null && totalIntake > ul;

    return {
      nutrientId: intake.nutrientId,
      intakeCanonical: totalIntake,
      rda,
      rdaType,
      ul,
      pctRda,
      overUl,
      confidenceBand: "high" as const,
      layer,
    };
  });
}

function resolveIntakeForLayer(intake: NutrientIntake, layer: AdequacyResult["layer"]): number {
  switch (layer) {
    case "food_only":
      return intake.foodOnly;
    case "food_plus_supplements":
      return intake.foodOnly + intake.supplementAmount;
    case "food_plus_supplements_plus_clinician_overrides":
      return intake.foodOnly + intake.supplementAmount + intake.clinicianOverride;
  }
}

function precedence(vt: ValueType): number {
  switch (vt) {
    case "PRI":
      return 3;
    case "AI":
      return 2;
    case "AR":
      return 1;
    default:
      return 0;
  }
}
