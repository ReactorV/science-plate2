import { calculateTargets } from "./targets";
import { pralFromTotals } from "./pral";
import { scoreAdequacy } from "./adequacy";
import { dayConfidence } from "./confidence";
import { computeHash } from "./hash";
import { evaluate as evaluateRules } from "@/lib/bioavailability/registry";
import type { ProfileInput, MacroTargets } from "./targets";
import type { NutrientIntake, ReferenceValueEntry, AdequacyResult } from "./adequacy";
import type { ConfidenceItem } from "./confidence";
import type { PralInput } from "./pral";
import type { DayInput, RuleResult } from "@/lib/bioavailability/types";

export interface DayScoreInput {
  profile: ProfileInput;
  nutrientTotals: PralInput & { [nutrientId: string]: number };
  intakes: NutrientIntake[];
  referenceValues: ReferenceValueEntry[];
  confidenceItems: ConfidenceItem[];
  dayInput?: DayInput;
  evidencePackVersion: string;
  ruleSetVersion: string;
}

export interface DayScoreResult {
  targets: MacroTargets;
  pral: number;
  adequacy: AdequacyResult[];
  confidence: number;
  ruleResults: RuleResult[];
  hash: string;
  evidencePackVersion: string;
}

/**
 * Core scoring pipeline — deterministic.
 * Same input → same hash byte-for-byte (AC-20).
 */
export async function scoreDay(input: DayScoreInput): Promise<DayScoreResult> {
  const targets = calculateTargets(input.profile);

  const pral = pralFromTotals({
    proteinG: input.nutrientTotals.proteinG,
    phosphorusMg: input.nutrientTotals.phosphorusMg,
    potassiumMg: input.nutrientTotals.potassiumMg,
    magnesiumMg: input.nutrientTotals.magnesiumMg,
    calciumMg: input.nutrientTotals.calciumMg,
  });

  const adequacy = scoreAdequacy(input.intakes, input.referenceValues, "food_only");
  const confidence = dayConfidence(input.confidenceItems);

  const ruleResults = input.dayInput ? evaluateRules(input.dayInput) : [];

  const hashInput = {
    nutrientTotals: input.nutrientTotals,
    intakes: input.intakes,
    referenceValues: input.referenceValues,
    confidenceItems: input.confidenceItems,
    ruleResults,
    evidencePackVersion: input.evidencePackVersion,
    ruleSetVersion: input.ruleSetVersion,
  };

  const hash = await computeHash(hashInput);

  return {
    targets,
    pral,
    adequacy,
    confidence,
    ruleResults,
    hash,
    evidencePackVersion: input.evidencePackVersion,
  };
}
