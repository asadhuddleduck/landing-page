import type { ReactNode } from "react";
import { HUDDLE_START } from "@/lib/huddle-start";
import "./coin.css";
import styles from "./PrimaryAction.module.css";

export default function PrimaryAction({
  children = "Set up your Direct Debit",
  href = HUDDLE_START.directDebitUrl,
  onClick, disabled = false, tone = "green",
}: {
  children?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "green" | "violet" | "gold";
}) {
  if (onClick) return <button type="button" disabled={disabled} onClick={onClick} data-tone={tone} className={`sp-primary sp-coin ${styles.action}`}>{children}</button>;
  return (
    <a
      data-tone={tone} className={`sp-primary sp-coin ${styles.action}`}
      href={href}
      target={href === HUDDLE_START.directDebitUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {children}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12h14m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {href === HUDDLE_START.directDebitUrl && <span className={styles.srOnly}> (opens GoCardless in a new tab)</span>}
    </a>
  );
}
