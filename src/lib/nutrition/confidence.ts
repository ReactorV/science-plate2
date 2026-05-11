export type ProvenanceTier = "analytical" | "branded" | "calculated" | "user" | "photo";

const PROVENANCE_WEIGHTS: Record<ProvenanceTier, number> = {
  analytical: 1.0,
  branded: 0.85,
  calculated: 0.7,
  user: 0.5,
  photo: 0.4,
};

export interface ConfidenceItem {
  provenanceTier: ProvenanceTier;
  kcalContribution: number; // relative weight
}

/**
 * Provenance-weighted mean of item confidences, weighted by kcal contribution.
 * AC-11: prototype seed day yields 0.84 ± 0.02.
 */
export function dayConfidence(items: ConfidenceItem[]): number {
  if (items.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of items) {
    const w = Math.max(0, item.kcalContribution);
    weightedSum += PROVENANCE_WEIGHTS[item.provenanceTier] * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}
