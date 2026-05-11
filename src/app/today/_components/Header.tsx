"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/foods", label: "Foods" },
  { href: "/plans", label: "Plans" },
  { href: "/athlete", label: "Athlete" },
  { href: "/lab", label: "Lab" },
] as const;

interface HeaderProps {
  onOpenInspector?: () => void;
}

export function Header({ onOpenInspector }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className={styles.hdr}>
      <div className={styles.hdrL}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16" cy="16" r="5.5" fill="currentColor" />
            <line x1="16" y1="3" x2="16" y2="29" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" />
          </svg>
          <span className={styles.word}>Plate</span>
          <span className={styles.ver}>v0.1 · MVP</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${pathname === href ? styles.active : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.hdrR}>
        <button className={styles.hdrBtn} onClick={onOpenInspector} type="button">
          <span className={styles.dot} /> Evidence
        </button>
        <button className={styles.hdrBtn} type="button">
          ⌘K
        </button>
        <div className={styles.avatar}>M</div>
      </div>
    </header>
  );
}
