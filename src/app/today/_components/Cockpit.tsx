import { Conf } from "./primitives/Conf";
import type { ConfLevel } from "./primitives/Conf";
import styles from "./Cockpit.module.css";

interface CockpitData {
  targets: { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
  totals: { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
  pral: number;
  confidence: number;
}

interface CockpitProps {
  data: CockpitData;
}

interface CellDef {
  label: string;
  value: number;
  unit: string;
  target: number;
  delta: number;
  conf: ConfLevel;
  isPral?: boolean;
  note?: string;
}

export function Cockpit({ data }: CockpitProps) {
  const d = data;
  const items: CellDef[] = [
    { label: "Energy", value: d.totals.kcal, unit: "kcal", target: d.targets.kcal, delta: d.totals.kcal - d.targets.kcal, conf: "high" },
    { label: "Protein", value: d.totals.protein, unit: "g", target: d.targets.protein, delta: d.totals.protein - d.targets.protein, conf: "high" },
    { label: "Carbs", value: d.totals.carbs, unit: "g", target: d.targets.carbs, delta: d.totals.carbs - d.targets.carbs, conf: "high" },
    { label: "Fat", value: d.totals.fat, unit: "g", target: d.targets.fat, delta: d.totals.fat - d.targets.fat, conf: "high" },
    { label: "Fibre", value: d.totals.fibre, unit: "g", target: d.targets.fibre, delta: d.totals.fibre - d.targets.fibre, conf: "med" },
    { label: "PRAL", value: d.pral, unit: "mEq", target: 0, delta: d.pral, conf: "med", isPral: true, note: "alkaline-leaning" },
  ];

  return (
    <section className={styles.cockpit} aria-label="Daily nutritional cockpit">
      {items.map((it) => {
        const pct = it.isPral ? null : Math.min(100, Math.round((it.value / it.target) * 100));
        const deltaClass =
          Math.abs(it.delta) <= it.target * 0.05
            ? styles.deltaOk
            : it.delta < 0
              ? styles.deltaLo
              : styles.deltaHi;

        return (
          <div key={it.label} className={styles.cell}>
            <div className={styles.cellK}>
              <span>{it.label}</span>
              <Conf level={it.conf} />
            </div>
            <div className={styles.cellV}>
              <span className={styles.num}>{it.value}</span>
              <span className={styles.unit}>{it.unit}</span>
            </div>
            <div className={styles.cellMeta}>
              {it.isPral ? (
                <span className={styles.muted}>target −5 to +5 · {it.note}</span>
              ) : (
                <>
                  <span className={styles.muted}>
                    / {it.target}
                    {it.unit}
                  </span>
                  <span className={`${styles.delta} ${deltaClass}`}>
                    {it.delta >= 0 ? "+" : ""}
                    {it.delta}
                  </span>
                </>
              )}
            </div>
            {pct !== null && (
              <div className={styles.cellBar}>
                <div style={{ width: `${pct}%` }} />
              </div>
            )}
            {it.isPral && (
              <div className={styles.pralBar}>
                <div className={styles.pralAxis} />
                <div
                  className={styles.pralMark}
                  style={{ left: `${Math.max(0, Math.min(100, 50 + it.value * 2))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
