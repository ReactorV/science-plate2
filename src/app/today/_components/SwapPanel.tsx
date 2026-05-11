import type { AdequacyResult } from "@/lib/nutrition/adequacy";
import styles from "./SwapPanel.module.css";

export interface SwapSuggestion {
  id: string;
  title: string;
  impact: Record<string, string>;
  reason: string;
}

interface SwapPanelProps {
  adequacy: AdequacyResult[];
}

/**
 * Heuristic swap generator — no LP solver.
 * Finds the biggest deficit nutrient and suggests ≤ 3 ranked swaps.
 */
export function generateSwapSuggestions(adequacy: AdequacyResult[]): SwapSuggestion[] {
  const deficits = adequacy
    .filter((a) => a.pctRda !== null && a.pctRda < 100)
    .sort((a, b) => (a.pctRda ?? 0) - (b.pctRda ?? 0));

  if (deficits.length === 0) return [];

  const suggestions: SwapSuggestion[] = [];
  const topDeficit = deficits[0];

  const SWAP_HINTS: Record<string, SwapSuggestion[]> = {
    iron: [
      { id: "s-iron-1", title: "Add pumpkin seeds to breakfast", impact: { iron: "+3mg", kcal: "+90" }, reason: "Rich non-heme iron source." },
      { id: "s-iron-2", title: "Swap bread → fortified cereal", impact: { iron: "+5mg", kcal: "−20" }, reason: "Fortified cereals have high bioavailable iron." },
      { id: "s-iron-3", title: "Add lemon to lentil bowl", impact: { iron: "+15% abs", kcal: "+5" }, reason: "Vitamin C enhances iron absorption." },
    ],
    calcium: [
      { id: "s-ca-1", title: "Add 200ml milk to oats", impact: { calcium: "+220mg", kcal: "+90" }, reason: "Efficient calcium source." },
      { id: "s-ca-2", title: "Swap feta → sardines", impact: { calcium: "+180mg", omega3: "+0.6g" }, reason: "Bones in sardines are calcium-rich." },
    ],
    vitamin_d: [
      { id: "s-vd-1", title: "Swap feta → sardines", impact: { vit_d: "+4µg", omega3: "+0.6g" }, reason: "Closes vit-D gap with minimal kcal change." },
      { id: "s-vd-2", title: "Add egg to breakfast", impact: { vit_d: "+1.5µg", kcal: "+75" }, reason: "Egg yolks are a natural D source." },
    ],
  };

  const hints = SWAP_HINTS[topDeficit.nutrientId] ?? [
    {
      id: `s-${topDeficit.nutrientId}-1`,
      title: `Increase ${topDeficit.nutrientId}-rich foods`,
      impact: { [topDeficit.nutrientId]: "+15%" },
      reason: `Current intake is ${Math.round(topDeficit.pctRda ?? 0)}% of RDA.`,
    },
  ];

  suggestions.push(...hints.slice(0, 3));
  return suggestions;
}

export function SwapPanel({ adequacy }: SwapPanelProps) {
  const swaps = generateSwapSuggestions(adequacy);

  return (
    <section className={styles.swaps} aria-label="Swap suggestions">
      <div className={styles.swapsHead}>
        <h2>Swap suggestions</h2>
        <span className={styles.muted}>{swaps.length} options</span>
      </div>
      {swaps.length === 0 ? (
        <div className={styles.empty}>All nutrients are at or above target. No swaps needed.</div>
      ) : (
        <ul className={styles.swapList}>
          {swaps.map((s) => (
            <li key={s.id} className={styles.swap}>
              <div className={styles.swapL}>
                <div className={styles.swapTitle}>{s.title}</div>
                <div className={styles.swapReason}>{s.reason}</div>
              </div>
              <div className={styles.swapImpact}>
                {Object.entries(s.impact).map(([k, v]) => (
                  <span key={k} className={styles.imp}>
                    <em>{k}</em>
                    {v}
                  </span>
                ))}
              </div>
              <button className={styles.btn} type="button" disabled title="Coming soon">
                Apply
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
