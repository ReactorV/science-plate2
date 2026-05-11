"use client";

import { useState } from "react";
import { Conf } from "./primitives/Conf";
import type { ConfLevel } from "./primitives/Conf";
import styles from "./MicronutrientScorecard.module.css";

export interface NutrientRow {
  key: string;
  group: "min" | "vit" | "fat";
  intake: number;
  unit: string;
  rda: number;
  ul: number | null;
  conf: ConfLevel;
}

interface MicronutrientScorecardProps {
  nutrients: NutrientRow[];
}

type ViewMode = "list" | "heatmap";

function getBand(pct: number, ulPct: number | null): string {
  if (ulPct !== null && ulPct >= 100) return "hi";
  if (pct < 67) return "lo";
  if (pct < 100) return "mid";
  return "ok";
}

export function MicronutrientScorecard({ nutrients }: MicronutrientScorecardProps) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <section className={styles.ngrid} aria-label="Micronutrient adequacy">
      <div className={styles.ngridHead}>
        <h2>Micronutrient adequacy</h2>
        <div className={styles.legend}>
          <span><i className={`${styles.sw} ${styles.swLo}`} /> below AR</span>
          <span><i className={`${styles.sw} ${styles.swMid}`} /> AR–PRI</span>
          <span><i className={`${styles.sw} ${styles.swOk}`} /> PRI met</span>
          <span><i className={`${styles.sw} ${styles.swHi}`} /> over UL</span>
        </div>
      </div>

      <div className={styles.toggles}>
        <button
          className={`${styles.toggle} ${view === "list" ? styles.active : ""}`}
          onClick={() => setView("list")}
          type="button"
        >
          List
        </button>
        <button
          className={`${styles.toggle} ${view === "heatmap" ? styles.active : ""}`}
          onClick={() => setView("heatmap")}
          type="button"
        >
          Heatmap
        </button>
      </div>

      {view === "list" ? (
        <div>
          {nutrients.map((n) => {
            const pct = n.rda > 0 ? (n.intake / n.rda) * 100 : 0;
            const ulPct = n.ul ? (n.intake / n.ul) * 100 : null;
            const band = getBand(pct, ulPct);

            return (
              <div key={n.key} className={styles.nrow}>
                <div className={styles.ncellName}>{n.key}</div>
                <div className={styles.ncellNum}>
                  <span>{n.intake}</span>
                  <span>{n.unit}</span>
                  <Conf level={n.conf} />
                </div>
                <div className={styles.ncellBar}>
                  <div className={styles.nbar}>
                    <div
                      className={`${styles.nbarFill} ${styles[band]}`}
                      style={{ width: `${Math.min(150, pct)}%` }}
                    />
                    <div className={styles.nbarPri} />
                    {n.ul && (
                      <div
                        className={styles.nbarUl}
                        style={{ left: `${n.rda > 0 ? Math.min(150, (n.ul / n.rda) * 100) : 0}%` }}
                        title="UL"
                      />
                    )}
                  </div>
                  <div className={styles.nrowMeta}>
                    <span>PRI {n.rda}{n.unit}</span>
                    {n.ul && <span> · UL {n.ul}{n.unit}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.heatmap}>
          {nutrients.map((n) => {
            const pct = n.rda > 0 ? (n.intake / n.rda) * 100 : 0;
            const ulPct = n.ul ? (n.intake / n.ul) * 100 : null;
            const band = getBand(pct, ulPct);

            return (
              <div key={n.key} className={`${styles.heatCell} ${styles[band]}`}>
                <div className={styles.heatLabel}>{n.key}</div>
                <div className={styles.heatValue}>{Math.round(pct)}%</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
