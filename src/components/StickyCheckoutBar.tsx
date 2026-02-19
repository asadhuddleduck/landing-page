"use client";

import { useState, useEffect } from "react";

export default function StickyCheckoutBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const btn = document.querySelector(".checkout-btn");
    if (!btn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when button is NOT intersecting
        // AND the button is above the viewport (user scrolled past it)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  function handleClick() {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      className={`sticky-checkout-bar${visible ? " sticky-checkout-visible" : ""}`}
    >
      <div className="sticky-checkout-inner">
        <div className="sticky-checkout-info">
          <span className="sticky-checkout-name">AI Ad Engine Pilot</span>
          <span className="sticky-checkout-price">£497</span>
        </div>
        <button onClick={handleClick} className="sticky-checkout-btn">
          Start Your Pilot
        </button>
      </div>
    </div>
  );
}
