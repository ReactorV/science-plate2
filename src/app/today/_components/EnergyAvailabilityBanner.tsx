import styles from "./EnergyAvailabilityBanner.module.css";

interface EnergyAvailabilityBannerProps {
  kcalIntake: number;
  exerciseKcal: number;
  weightKg: number;
  bodyFatPct?: number;
}

export function EnergyAvailabilityBanner({
  kcalIntake,
  exerciseKcal,
  weightKg,
  bodyFatPct,
}: EnergyAvailabilityBannerProps) {
  // Estimate FFM and EA
  const fatFraction = (bodyFatPct ?? 25) / 100;
  const ffm = weightKg * (1 - fatFraction);
  const eaKcalPerKgFFM = ffm > 0 ? (kcalIntake - exerciseKcal) / ffm : 0;

  const risk: "low" | "moderate" | "high" =
    eaKcalPerKgFFM < 30 ? "high" : eaKcalPerKgFFM < 45 ? "moderate" : "low";

  const riskClass = risk === "low" ? styles.low : risk === "moderate" ? styles.moderate : styles.high;
  const icon = risk === "low" ? "✓" : risk === "moderate" ? "⚠" : "🚨";

  if (risk === "low") return null;

  return (
    <div className={`${styles.banner} ${riskClass}`} role="alert">
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <span className={styles.label}>Energy availability:</span>
        <span className={styles.value}>{eaKcalPerKgFFM.toFixed(0)} kcal/kg FFM</span>
        {" — "}
        {risk === "high"
          ? "Below IOC 2023 threshold (30 kcal/kg FFM). RED-S risk elevated."
          : "Approaching low threshold. Monitor closely."}
      </div>
    </div>
  );
}
