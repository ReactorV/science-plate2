"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Cockpit } from "./Cockpit";
import { TrainingTimeline } from "./TrainingTimeline";
import { MealCard } from "./MealCard";
import { MicronutrientScorecard } from "./MicronutrientScorecard";
import { SwapPanel } from "./SwapPanel";
import { EvidenceDrawer } from "./EvidenceDrawer";
import type { MealCardData } from "./MealCard";
import type { NutrientRow } from "./MicronutrientScorecard";
import type { TrainingSession } from "./TrainingTimeline";
import type { AdequacyResult } from "@/lib/nutrition/adequacy";
import type { RuleResult } from "@/lib/bioavailability/types";
import styles from "../page.module.css";

export interface TodayCockpitData {
  targets: { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
  totals: { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
  pral: number;
  confidence: number;
  training: TrainingSession[];
  meals: MealCardData[];
  nutrients: NutrientRow[];
  adequacy: AdequacyResult[];
  hash: string;
  evidencePackVersion: string;
}

interface TodayCockpitShellProps {
  data: TodayCockpitData;
}

export function TodayCockpitShell({ data }: TodayCockpitShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const selectedMeal = data.meals.find((m) => m.id === selectedMealId);
  const drawerRuleResults: RuleResult[] = selectedMeal?.ruleResults
    ?? data.meals.flatMap((m) => m.ruleResults ?? []);

  function handleMealSelect(id: string) {
    setSelectedMealId(id);
    setDrawerOpen(true);
  }

  return (
    <div className={styles.main}>
      <Header onOpenInspector={() => setDrawerOpen(true)} />

      <div className={styles.content}>
        <div className={styles.left}>
          <Cockpit
            data={{
              targets: data.targets,
              totals: data.totals,
              pral: data.pral,
              confidence: data.confidence,
            }}
          />

          <TrainingTimeline
            training={data.training}
            confidence={data.confidence}
            mealCount={data.meals.length}
          />

          <div className={styles.meals}>
            {data.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onSelect={handleMealSelect} />
            ))}
          </div>

          <MicronutrientScorecard nutrients={data.nutrients} />
        </div>

        <div className={styles.right}>
          <SwapPanel adequacy={data.adequacy} />
        </div>
      </div>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedMealId(null);
        }}
        hash={data.hash}
        evidencePackVersion={data.evidencePackVersion}
        ruleResults={drawerRuleResults}
      />
    </div>
  );
}
