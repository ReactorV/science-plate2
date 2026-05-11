import styles from "./Provenance.module.css";

export type ProvenanceSrc = "fdc" | "ciqual" | "branded" | "calc" | "user" | "photo";

const LABELS: Record<ProvenanceSrc, { l: string; t: string }> = {
  fdc: { l: "FDC", t: "USDA FoodData Central · analytical" },
  ciqual: { l: "CIQUAL", t: "Anses CIQUAL · analytical" },
  branded: { l: "BRAND", t: "Branded label · vendor-supplied" },
  calc: { l: "CALC", t: "Calculated from recipe" },
  user: { l: "USER", t: "User-entered · low confidence" },
  photo: { l: "PHOTO", t: "Image-estimated · low confidence" },
};

interface ProvenanceProps {
  src: ProvenanceSrc;
}

export function Provenance({ src }: ProvenanceProps) {
  const it = LABELS[src] ?? LABELS.calc;
  return (
    <span className={styles.prov} title={it.t} role="img" aria-label={it.t}>
      {it.l}
    </span>
  );
}
