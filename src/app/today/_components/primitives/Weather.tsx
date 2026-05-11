import styles from "./Weather.module.css";

export type WeatherKind = "sun" | "cloud" | "rain";

interface WeatherProps {
  kind: WeatherKind;
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export function Weather({ kind }: WeatherProps) {
  if (kind === "sun") {
    return (
      <svg viewBox="0 0 24 24" className={`${styles.weather} ${styles.sun}`} aria-label="favourable absorption" role="img">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
        {RAYS.map((a) => (
          <line
            key={a}
            x1="12"
            y1="12"
            x2={12 + 9 * Math.cos((a * Math.PI) / 180)}
            y2={12 + 9 * Math.sin((a * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 24 24" className={`${styles.weather} ${styles.cloud}`} aria-label="neutral / mixed" role="img">
        <path
          d="M6 16h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.2A4 4 0 0 0 6 16Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`${styles.weather} ${styles.rain}`} aria-label="absorption inhibitor" role="img">
      <path d="M6 13h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.2A4 4 0 0 0 6 13Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="9" y1="16" x2="8" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="13" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="17" y1="16" x2="16" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
