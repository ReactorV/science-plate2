import { TodayCockpitShell } from "./_components/TodayCockpitShell";
import type { TodayCockpitData } from "./_components/TodayCockpitShell";
import type { AdequacyResult } from "@/lib/nutrition/adequacy";

// Seed data — will be replaced with Drizzle query + scoreDay() once DB layer is wired.
const SEED_TARGETS = { kcal: 2180, protein: 124, carbs: 270, fat: 72, fibre: 32 };
const SEED_TOTALS = { kcal: 2114, protein: 121, carbs: 258, fat: 71, fibre: 34 };

const SEED_ADEQUACY: AdequacyResult[] = [
  { nutrientId: "iron", intakeCanonical: 17400, rda: 16000, rdaType: "PRI", ul: 45000, pctRda: 108.75, overUl: false, confidenceBand: "medium", layer: "food_only" },
  { nutrientId: "zinc", intakeCanonical: 11200, rda: 7500, rdaType: "PRI", ul: 25000, pctRda: 149.3, overUl: false, confidenceBand: "medium", layer: "food_only" },
  { nutrientId: "iodine", intakeCanonical: 96, rda: 150, rdaType: "PRI", ul: 600, pctRda: 64, overUl: false, confidenceBand: "low", layer: "food_only" },
  { nutrientId: "vitamin_d", intakeCanonical: 12, rda: 15, rdaType: "PRI", ul: 100, pctRda: 80, overUl: false, confidenceBand: "medium", layer: "food_only" },
  { nutrientId: "omega3", intakeCanonical: 2100, rda: 2500, rdaType: "AI", ul: null, pctRda: 84, overUl: false, confidenceBand: "medium", layer: "food_only" },
];

const PAGE_DATA: TodayCockpitData = {
  targets: SEED_TARGETS,
  totals: SEED_TOTALS,
  pral: -7.4,
  confidence: 0.84,
  training: [
    { id: "t1", time: "07:30", end: "08:15", label: "Z2 run", kcal: 410 },
    { id: "t2", time: "18:00", end: "19:00", label: "Strength · lower", kcal: 290 },
  ],
  meals: [
    { id: "m1", time: "06:45", name: "Pre-run sip", kcal: 120, protein: 2, carbs: 28, fat: 0, provenance: "calc", confidence: 0.9, weather: "sun" },
    {
      id: "m2", time: "09:00", name: "Recovery breakfast", kcal: 540, protein: 32, carbs: 64, fat: 16, provenance: "fdc", confidence: 0.93, weather: "sun",
      ruleResults: [{ ruleId: "fe-vitc", ruleVersion: "1.0.0", evidenceRefs: ["Hallberg1989", "Cook2001"], kind: "synergy", affects: ["iron"], humanReason: "Vitamin C from kiwi enhances iron absorption from oats + seeds.", mealIndex: 1 }],
    },
    {
      id: "m3", time: "12:45", name: "Lunch · grain bowl", kcal: 620, protein: 34, carbs: 78, fat: 18, provenance: "fdc", confidence: 0.88, weather: "sun",
      ruleResults: [{ ruleId: "fe-vitc", ruleVersion: "1.0.0", evidenceRefs: ["Hallberg1989"], kind: "synergy", affects: ["iron"], humanReason: "Lemon + peppers provide vitamin C.", mealIndex: 2 }],
    },
    {
      id: "m4", time: "16:30", name: "Snack", kcal: 180, protein: 6, carbs: 22, fat: 8, provenance: "branded", confidence: 0.78, weather: "cloud",
      ruleResults: [{ ruleId: "tea-iron", ruleVersion: "1.0.0", evidenceRefs: ["Hurrell1999"], kind: "caution", affects: ["iron"], humanReason: "Tea polyphenols may reduce iron absorption.", mealIndex: 3 }],
    },
    { id: "m5", time: "19:30", name: "Post-lift dinner", kcal: 654, protein: 47, carbs: 66, fat: 29, provenance: "fdc", confidence: 0.91, weather: "sun" },
  ],
  nutrients: [
    { key: "Iron", group: "min", intake: 17.4, unit: "mg", rda: 16, ul: 45, conf: "med" },
    { key: "Zinc", group: "min", intake: 11.2, unit: "mg", rda: 7.5, ul: 25, conf: "med" },
    { key: "Calcium", group: "min", intake: 980, unit: "mg", rda: 950, ul: 2500, conf: "high" },
    { key: "Magnesium", group: "min", intake: 412, unit: "mg", rda: 300, ul: 250, conf: "high" },
    { key: "Potassium", group: "min", intake: 3640, unit: "mg", rda: 3500, ul: null, conf: "high" },
    { key: "Sodium", group: "min", intake: 1980, unit: "mg", rda: 2000, ul: 5000, conf: "high" },
    { key: "Iodine", group: "min", intake: 96, unit: "µg", rda: 150, ul: 600, conf: "low" },
    { key: "Selenium", group: "min", intake: 78, unit: "µg", rda: 70, ul: 255, conf: "med" },
    { key: "Vit A", group: "vit", intake: 820, unit: "µg", rda: 650, ul: 3000, conf: "high" },
    { key: "Vit C", group: "vit", intake: 184, unit: "mg", rda: 95, ul: null, conf: "high" },
    { key: "Vit D", group: "vit", intake: 12, unit: "µg", rda: 15, ul: 100, conf: "med" },
    { key: "Vit E", group: "vit", intake: 14.2, unit: "mg", rda: 11, ul: 300, conf: "high" },
    { key: "Vit K", group: "vit", intake: 142, unit: "µg", rda: 70, ul: null, conf: "high" },
    { key: "Folate", group: "vit", intake: 488, unit: "µg", rda: 330, ul: 1000, conf: "high" },
    { key: "B12", group: "vit", intake: 4.8, unit: "µg", rda: 4, ul: null, conf: "high" },
    { key: "Omega-3", group: "fat", intake: 2.1, unit: "g", rda: 2.5, ul: null, conf: "med" },
  ],
  adequacy: SEED_ADEQUACY,
  hash: "3f9ca14b02e8d7f6a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718",
  evidencePackVersion: "1.0.0",
};

export default async function TodayPage() {
  // TODO: Replace with live data once DB layer is wired:
  //   const day = await getDayPlan(new Date().toISOString().slice(0, 10));
  //   const score = await scoreDay(buildInput(day));
  return <TodayCockpitShell data={PAGE_DATA} />;
}
