import type { CSSProperties } from "react";
import styles from "./ClientLogoBar.module.css";

// Established Huddle Duck restaurant marks, using SuperPulse's optically sized
// monochrome assets. No runtime dependency on another product's customer feed.
const logos = [
  ["burger-and-sauce", "Burger & Sauce", 1099, 30],
  ["german-doner-kebab", "German Doner Kebab", 645, 28],
  ["phat-buns", "PHAT Buns", 237, 34],
  ["dough-club", "Dough Club", 755, 34],
  ["chai-green", "Chai Green", 798, 32],
  ["boo", "Boo", 477, 28],
  ["shakedown", "Shakedown", 177, 34],
  ["drip-chicken", "Drip Chicken", 1581, 25],
  ["burgshake", "Burgshake", 1279, 27],
  ["zezu", "Zezu", 350, 30],
  ["fusion-treats", "Fusion Treats", 426, 30],
  ["tasty-plaice", "Tasty Plaice", 626, 28],
] as const;

type Logo = (typeof logos)[number];
type LogoStyle = CSSProperties & { "--client-logo-height": string };

function LogoGroup({
  items,
  hidden = false,
}: {
  items: readonly Logo[];
  hidden?: boolean;
}) {
  return (
    <div
      className={`${styles.group} ${hidden ? styles.clone : ""}`}
      aria-hidden={hidden || undefined}
    >
      {[0, 1, 2].map((repeat) => (
        <div
          key={repeat}
          className={repeat ? styles.repeat : undefined}
          style={!repeat ? { display: "contents" } : undefined}
          aria-hidden={repeat ? true : undefined}
        >
          {items.map(([id, name, width, opticalHeight]) => (
            // Eager loading prevents empty marks as a transformed lane scrolls.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={id}
              className={styles.logo}
              src={`/brand/huddle/client-logos/${id}.webp`}
              alt={hidden || repeat ? "" : name}
              width={width}
              height={192}
              style={
                { "--client-logo-height": `${opticalHeight}px` } as LogoStyle
              }
              decoding="async"
              loading="eager"
              fetchPriority="low"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ClientLogoBar() {
  const lanes = [
    logos.filter((_, i) => i % 2 === 0),
    logos.filter((_, i) => i % 2 === 1),
  ];
  return (
    <div
      className={`${styles.root} ${styles.light}`}
      role="region"
      aria-label="Trusted by restaurant brands"
    >
      <p className={styles.caption}>Trusted by restaurant brands</p>
      <div className={styles.rows}>
        {lanes.map((items, index) => (
          <div
            key={index}
            className={`${styles.viewport} ${index === 0 ? styles.forward : styles.reverse}`}
            tabIndex={0}
            role="group"
            aria-label={`Client logos, row ${index + 1} of 2`}
          >
            <div className={styles.track}>
              <LogoGroup items={items} />
              <LogoGroup items={items} hidden />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
