import styles from "./TrainingTimeline.module.css";

export interface TrainingSession {
  id: string;
  time: string;
  end: string;
  label: string;
  kcal: number;
}

interface TrainingTimelineProps {
  training: TrainingSession[];
  confidence: number;
  mealCount: number;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

function toX(t: string): number {
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return Math.max(0, Math.min(100, ((h - 6 + m / 60) / 16) * 100));
}

export function TrainingTimeline({ training, confidence, mealCount }: TrainingTimelineProps) {
  return (
    <section className={styles.timeline} aria-label="Day timeline">
      <div className={styles.tlHead}>
        <div className={styles.tlTitle}>
          <h2>Day</h2>
          <div className={styles.tlSub}>
            <span>
              EA risk <em className={styles.ok}>low</em>
            </span>
            <span className={styles.sep}>·</span>
            <span>
              Confidence <em>{Math.round(confidence * 100)}%</em>
            </span>
            <span className={styles.sep}>·</span>
            <span>
              {mealCount} meals · {training.length} sessions
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tlGrid}>
        <div className={styles.tlAxis}>
          {HOURS.map((h) => (
            <div key={h} className={styles.tlTick}>
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className={styles.rail}>
          <div className={styles.railLabel}>Training</div>
          <div className={styles.railTrack}>
            {training.map((t) => {
              const x1 = toX(t.time);
              const x2 = toX(t.end);
              return (
                <div key={t.id} className={styles.trainBlock} style={{ left: `${x1}%`, width: `${x2 - x1}%` }}>
                  <div className={styles.tbBar} />
                  <div className={styles.tbMeta}>
                    <span>{t.time}</span>
                    <span>{t.label}</span>
                    <span className={styles.tbKcal}>−{t.kcal}kcal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
