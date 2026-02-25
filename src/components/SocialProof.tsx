"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  { end: 125, suffix: "+", label: "locations", prefix: "" },
  { end: 9.7, suffix: "M+", label: "ad spend managed", prefix: "£", decimals: 1 },
  { end: 10, suffix: "/10", label: "avg client NPS (3mo+)", prefix: "" },
  { end: 7, suffix: "", label: "years running", prefix: "" },
];

interface MetricDef {
  end: number;
  suffix: string;
  prefix: string;
  decimals?: number;
}

function AnimatedNumber({ end, suffix, prefix, decimals }: MetricDef) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1600;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * end);
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  const display = decimals
    ? value.toFixed(value >= end ? decimals : 1)
    : end >= 1000
      ? Math.round(value).toLocaleString()
      : String(Math.round(value));

  return (
    <span ref={ref} className="social-proof-number">
      {prefix}{display}{suffix}
    </span>
  );
}

export default function SocialProof() {
  return (
    <section className="section social-proof-section">
      <div className="social-proof-strip">
        {metrics.map((m, i) => (
          <div key={m.label} className="social-proof-item">
            <AnimatedNumber end={m.end} suffix={m.suffix} prefix={m.prefix} decimals={m.decimals} />
            <span className="social-proof-label">{m.label}</span>
            {i < metrics.length - 1 && <span className="social-proof-divider" />}
          </div>
        ))}
      </div>
    </section>
  );
}
