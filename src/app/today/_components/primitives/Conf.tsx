import styles from "./Conf.module.css";

export type ConfLevel = "high" | "med" | "low";

interface ConfProps {
  level: ConfLevel;
}

const LEVEL_MAP: Record<ConfLevel, number> = { high: 3, med: 2, low: 1 };

export function Conf({ level }: ConfProps) {
  const n = LEVEL_MAP[level] ?? 2;
  return (
    <span className={styles.conf} aria-label={`Confidence: ${level}`} role="img">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`${styles.tick} ${i < n ? styles.on : ""}`} />
      ))}
    </span>
  );
}
