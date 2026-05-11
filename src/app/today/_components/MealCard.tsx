"use client";

import { Conf } from "./primitives/Conf";
import { Provenance } from "./primitives/Provenance";
import { Weather } from "./primitives/Weather";
import type { ConfLevel } from "./primitives/Conf";
import type { ProvenanceSrc } from "./primitives/Provenance";
import type { WeatherKind } from "./primitives/Weather";
import type { RuleResult } from "@/lib/bioavailability/types";
import styles from "./MealCard.module.css";

export interface MealCardData {
  id: string;
  time: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  provenance: ProvenanceSrc;
  confidence: number;
  weather: WeatherKind;
  ruleResults?: RuleResult[];
}

interface MealCardProps {
  meal: MealCardData;
  onSelect?: (id: string) => void;
}

function confLevel(c: number): ConfLevel {
  if (c > 0.9) return "high";
  if (c > 0.8) return "med";
  return "low";
}

function chipStyle(kind: string): string {
  switch (kind) {
    case "synergy": return styles.chipSynergy;
    case "caution": return styles.chipCaution;
    case "warning": return styles.chipWarning;
    default: return "";
  }
}

export function MealCard({ meal, onSelect }: MealCardProps) {
  return (
    <button
      className={styles.card}
      type="button"
      aria-label={`${meal.name} at ${meal.time}, ${meal.kcal} kcal`}
      onClick={() => onSelect?.(meal.id)}
    >
      <div className={styles.cardTop}>
        <Weather kind={meal.weather} />
        <span className={styles.time}>{meal.time}</span>
        <Provenance src={meal.provenance} />
        <Conf level={confLevel(meal.confidence)} />
      </div>
      <div className={styles.name}>{meal.name}</div>
      <div className={styles.kcal}>
        {meal.kcal} <span className={styles.kcalUnit}>kcal</span>
      </div>
      <div className={styles.macBar}>
        <span className={styles.macP} style={{ flex: meal.protein }} />
        <span className={styles.macC} style={{ flex: meal.carbs }} />
        <span className={styles.macF} style={{ flex: meal.fat }} />
      </div>
      {meal.ruleResults && meal.ruleResults.length > 0 && (
        <div className={styles.chips}>
          {meal.ruleResults.map((r) => (
            <span key={r.ruleId} className={`${styles.chip} ${chipStyle(r.kind)}`}>
              {r.kind === "synergy" ? "☀" : r.kind === "caution" ? "☁" : "⚠"} {r.ruleId}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
