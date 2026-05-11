"use client";

import { useEffect, useRef } from "react";
import type { RuleResult } from "@/lib/bioavailability/types";
import styles from "./EvidenceDrawer.module.css";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  hash?: string;
  evidencePackVersion?: string;
  ruleResults?: RuleResult[];
}

export function EvidenceDrawer({
  open,
  onClose,
  hash,
  evidencePackVersion,
  ruleResults,
}: EvidenceDrawerProps) {
  const shortHash = hash ? hash.slice(0, 4) + "·" + hash.slice(4, 8) + "·" + hash.slice(8, 12) : "—";
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus the close button when drawer opens; restore focus on close
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Trap focus within drawer when open
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      ref={drawerRef}
      className={`${styles.drawer} ${open ? styles.on : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Evidence inspector"
      aria-describedby="evidence-drawer-description"
    >
      <div className={styles.drawerHead}>
        <h3>Evidence inspector</h3>
        <button ref={closeRef} className={styles.close} onClick={onClose} type="button" aria-label="Close evidence inspector">
          ×
        </button>
      </div>
      <div id="evidence-drawer-description" className={styles.drawerBody}>
        <div className={styles.evStack}>
          {/* TODO: wire these rows from live ruleResults + evidencePackVersion once DB layer is connected (AC-21) */}
          <div className={styles.evRow} data-testid="ev-sources">
            <span className={styles.evK}>Sources</span>
            <span className={styles.evV}>USDA FDC · EFSA DRV</span>
          </div>
          <div className={styles.evRow} data-testid="ev-reference-pack">
            <span className={styles.evK}>Reference pack</span>
            <span className={styles.evV}>EFSA PRI · adult female 19–50</span>
          </div>
          <div className={styles.evRow} data-testid="ev-pral">
            <span className={styles.evK}>PRAL</span>
            <span className={styles.evV}>Remer–Manz, computed live from current nutrients</span>
          </div>
          <div className={styles.evRow} data-testid="ev-iron-rules">
            <span className={styles.evK}>Iron bioavail. rules</span>
            <span className={styles.evV}>vit-C synergy, polyphenol penalty, calcium-suppl. timing</span>
          </div>
          <div className={styles.evRow} data-testid="ev-reds-guardrail">
            <span className={styles.evK}>RED-S guardrail</span>
            <span className={styles.evV}>IOC 2023 consensus, EA &lt; 30 kcal/kg FFM flagged</span>
          </div>
          <div className={styles.evRow} data-testid="ev-hash">
            <span className={styles.evK}>Calculation hash</span>
            <span className={`${styles.evV} ${styles.mono}`}>{shortHash}</span>
          </div>
          <div className={styles.evRow} data-testid="ev-evidence-pack">
            <span className={styles.evK}>Evidence pack</span>
            <span className={styles.evV}>{evidencePackVersion ?? "—"} · changelog</span>
          </div>
        </div>

        {ruleResults && ruleResults.length > 0 && (
          <div className={styles.ruleSection}>
            <h4>Active rules</h4>
            {ruleResults.map((r, i) => (
              <div key={`${r.ruleId}-${i}`} className={styles.ruleItem}>
                <span className={styles.ruleId}>{r.ruleId}</span>{" "}
                <span className={styles.ruleVer}>v{r.ruleVersion}</span>
                <div className={styles.ruleReason}>{r.humanReason}</div>
                <div className={styles.ruleRefs}>refs: {r.evidenceRefs.join(", ")}</div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.evNote}>
          Plate reports estimates with confidence bands. Numbers shown reflect probabilistic absorbable
          intake, not lab-grade values. Not a medical device.
        </div>
      </div>
    </div>
  );
}
