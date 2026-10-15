import type { ReactNode } from "react";
import { HUDDLE_START } from "@/lib/huddle-start";
import "./coin.css";
import styles from "./PrimaryAction.module.css";

export default function PrimaryAction({
  children = "Set up your Direct Debit",
}: {
  children?: ReactNode;
}) {
  return (
    <a
      className={`sp-primary sp-coin ${styles.action}`}
      href={HUDDLE_START.directDebitUrl}
      target="_blank"
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
      <span className={styles.srOnly}> (opens GoCardless in a new tab)</span>
    </a>
  );
}
