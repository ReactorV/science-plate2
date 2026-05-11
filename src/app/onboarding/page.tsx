"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface FormData {
  sex: "M" | "F";
  age: string;
  weightKg: string;
  heightCm: string;
  activityLevel: string;
  goalType: string;
  goalRateKgPerWeek: string;
  referencePack: string;
}

const INITIAL: FormData = {
  sex: "F",
  age: "",
  weightKg: "",
  heightCm: "",
  activityLevel: "moderate",
  goalType: "maintain",
  goalRateKgPerWeek: "0",
  referencePack: "efsa-2017",
};

const STEPS = ["Profile", "Goals", "Reference"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const next = () => {
    if (step === 0) {
      if (!form.age || !form.weightKg || !form.heightCm) {
        setError("Please fill in all fields.");
        return;
      }
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // TODO: wire to server action
    router.push("/today");
  };

  return (
    <div className={styles.wizard}>
      <h1>Welcome to Plate</h1>
      <p className={styles.subtitle}>Set up your nutritional profile in 3 steps.</p>

      <div className={styles.progress}>
        {STEPS.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i <= step ? styles.active : ""}`} />
        ))}
      </div>

      {step === 0 && (
        <div className={styles.step}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="sex">Sex</label>
              <select id="sex" value={form.sex} onChange={(e) => set("sex", e.target.value)}>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="age">Age</label>
              <input id="age" type="number" min="18" max="99" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="31" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="weight">Weight (kg)</label>
              <input id="weight" type="number" min="30" max="300" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} placeholder="62" />
            </div>
            <div className={styles.field}>
              <label htmlFor="height">Height (cm)</label>
              <input id="height" type="number" min="120" max="250" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} placeholder="168" />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="activity">Activity level</label>
            <select id="activity" value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
              <option value="sedentary">Sedentary (desk job, little exercise)</option>
              <option value="light">Light (1–3 days/week exercise)</option>
              <option value="moderate">Moderate (3–5 days/week exercise)</option>
              <option value="very_active">Very active (6–7 days/week exercise)</option>
              <option value="extra_active">Extra active (athlete / physical job)</option>
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={styles.step}>
          <div className={styles.field}>
            <label htmlFor="goal">Goal</label>
            <select id="goal" value={form.goalType} onChange={(e) => set("goalType", e.target.value)}>
              <option value="maintain">Maintain weight</option>
              <option value="lose">Lose weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>
          {form.goalType !== "maintain" && (
            <div className={styles.field}>
              <label htmlFor="rate">Rate (kg/week)</label>
              <input
                id="rate"
                type="number"
                step="0.05"
                min="-1"
                max="1"
                value={form.goalRateKgPerWeek}
                onChange={(e) => set("goalRateKgPerWeek", e.target.value)}
                placeholder="-0.25"
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className={styles.step}>
          <div className={styles.field}>
            <label htmlFor="refPack">Reference pack</label>
            <select id="refPack" value={form.referencePack} onChange={(e) => set("referencePack", e.target.value)}>
              <option value="efsa-2017">EFSA 2017 (EU)</option>
              <option value="us-dri-2019">US DRI 2019</option>
            </select>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button className={styles.btn} type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Back
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} type="button" onClick={next}>
          {step === STEPS.length - 1 ? "Get started" : "Next"}
        </button>
      </div>
    </div>
  );
}
