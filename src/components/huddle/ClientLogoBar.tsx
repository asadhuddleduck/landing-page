import type { CSSProperties } from "react";
import { getClientLogos, type ClientLogo } from "@/lib/client-logos";
import styles from "./ClientLogoBar.module.css";

type LogoStyle = CSSProperties & { "--client-logo-height": string };

function LogoGroup({
  items,
  hidden = false,
}: {
  items: readonly ClientLogo[];
  hidden?: boolean;
}) {
  return (
    <div
      className={`${styles.group} ${hidden ? styles.clone : ""}`}
      aria-hidden={hidden || undefined}
    >
      {items.map(({ id, name, src, width, opticalHeight }) => (
        // Eager loading prevents empty marks as a transformed lane scrolls.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          className={styles.logo}
          src={src}
          alt={hidden ? "" : name}
          width={width}
          height={192}
          style={
            { "--client-logo-height": `${opticalHeight}px` } as LogoStyle
          }
          draggable={false}
          decoding="async"
          loading="eager"
          fetchPriority="low"
        />
      ))}
    </div>
  );
}

export default async function ClientLogoBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const logos = await getClientLogos();
  const lanes = [
    logos.filter((logo) => logo.lane === 1),
    logos.filter((logo) => logo.lane === 2),
  ];
  return (
    <div
      className={`${styles.root} ${styles[tone]}`}
      role="region"
      aria-label="Trusted by local businesses"
    >
      <p className={styles.caption}>Trusted by local businesses</p>
      <div className={styles.rows}>
        {lanes.map((items, index) => (
          <div
            key={index}
            className={`${styles.viewport} ${index === 0 ? styles.forward : styles.reverse}`}
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
