"use client";

import { useEffect, useState } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";
import ConvertedPrice from "./ConvertedPrice";
import { useCurrency } from "@/hooks/useCurrency";

// Scroll to #checkout section instead of redirecting to Stripe
function scrollToCheckout(setLoading: (v: boolean) => void) {
  setLoading(true);
  // Value reflects minimum tier. User selects actual tier at checkout.
  trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
  track("card_cta_click");

  const el = document.getElementById("checkout");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Reset loading after scroll
  setTimeout(() => setLoading(false), 500);
}

/* ────────── Pricing Card ────────── */
interface PricingCardProps {
  onShow: () => void;
}

export function PricingCard({ onShow }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const { convert } = useCurrency();

  useEffect(() => {
    onShow();
    track("card_shown", { card: "pricing" });
  }, [onShow]);

  return (
    <div className="chat-card chat-card-pricing">
      <div className="chat-card-header">
        <span className="chat-card-label">AI Ad Engine Trial</span>
        <div className="chat-card-price">
          <span className="chat-card-currency">£</span>
          <span className="chat-card-amount">497</span>
          <span className="chat-card-period">one-time</span>
        </div>
        <ConvertedPrice amountGBP={497} />
      </div>
      <div className="chat-card-features">
        <div className="chat-card-feature">
          <svg className="chat-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Avatar research and targeting</span>
        </div>
        <div className="chat-card-feature">
          <svg className="chat-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Ad creative (copy, video, voiceover)</span>
        </div>
        <div className="chat-card-feature">
          <svg className="chat-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>3-week managed campaign</span>
        </div>
        <div className="chat-card-feature">
          <svg className="chat-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Performance report and strategy review</span>
        </div>
      </div>
      <button
        className="chat-card-btn"
        onClick={() => scrollToCheckout(setLoading)}
        disabled={loading}
      >
        Start Your Trial
      </button>
      <p className="chat-card-fine">£497 Trial fee fully credited if you upgrade within 30 days</p>
      <p className="chat-card-unlimited-link" style={{
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        marginTop: "8px",
        cursor: "pointer"
      }} onClick={() => scrollToCheckout(setLoading)}>
        Or go unlimited - £1,300/mo{convert(1300) ? ` (${convert(1300)})` : ""}
      </p>
    </div>
  );
}

/* ────────── Testimonial Card ────────── */

interface TestimonialMeta {
  quote: string;
  brand: string;
  detail: string;
}

const TESTIMONIALS: Record<string, TestimonialMeta> = {
  phat_buns: {
    quote: "Rated us 10 out of 10. Stayed on after the Trial.",
    brand: "Phat Buns",
    detail: "15+ locations",
  },
  burger_sauce: {
    quote: "Campaign live in 72 hours. Kept running.",
    brand: "Burger & Sauce",
    detail: "Multi-location",
  },
  franchise: {
    quote: "Investor qualification flow. Filtered serious prospects from tyre-kickers.",
    brand: "Franchise Campaign",
    detail: "F&B brand",
  },
  shakedown: {
    quote: "Targeted ads in each area. Completely different from what the agency was doing.",
    brand: "Shakedown",
    detail: "Multi-location",
  },
  chai_green: {
    quote: "Each location gets its own targeting. Finally ads that make sense for a franchise.",
    brand: "Chai Green",
    detail: "Franchise",
  },
};

function pickTestimonial(agentText: string, locationCount?: number): TestimonialMeta {
  const lower = agentText.toLowerCase();
  // Brand keyword match takes priority
  if (lower.includes("phat buns")) return TESTIMONIALS.phat_buns;
  if (lower.includes("burger & sauce") || lower.includes("burger and sauce"))
    return TESTIMONIALS.burger_sauce;
  if (lower.includes("676")) return TESTIMONIALS.franchise;

  // Location count match
  if (locationCount !== undefined) {
    if (locationCount === 1) return TESTIMONIALS.burger_sauce;
    if (locationCount >= 2 && locationCount <= 5) return TESTIMONIALS.shakedown;
    if (locationCount >= 12) return TESTIMONIALS.chai_green;
    if (locationCount > 5) return TESTIMONIALS.phat_buns;
  }

  return TESTIMONIALS.phat_buns; // default
}

interface TestimonialCardProps {
  text: string;
  onShow: () => void;
  locationCount?: number;
}

export function TestimonialCard({ text, onShow, locationCount }: TestimonialCardProps) {
  const testimonial = pickTestimonial(text, locationCount);

  useEffect(() => {
    onShow();
    track("card_shown", { card: "testimonial" });
  }, [onShow]);

  return (
    <div className="chat-card chat-card-testimonial">
      <svg className="chat-card-quote-icon" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
      </svg>
      <p className="chat-card-quote">{testimonial.quote}</p>
      <div className="chat-card-attribution">
        <span className="chat-card-brand">{testimonial.brand}</span>
        <span className="chat-card-detail">{testimonial.detail}</span>
      </div>
    </div>
  );
}

/* ────────── Comparison Card ────────── */
interface ComparisonCardProps {
  onShow: () => void;
  locationCount?: number;
}

export function ComparisonCard({ onShow, locationCount = 5 }: ComparisonCardProps) {
  useEffect(() => {
    onShow();
    track("card_shown", { card: "comparison" });
  }, [onShow]);

  return (
    <div className="chat-card chat-card-comparison">
      <div className="chat-card-comparison-col chat-card-comparison-col--agency">
        <div className="chat-card-comparison-label">Typical Agency</div>
        <div className="chat-card-comparison-price">&pound;10,000-25,000/year</div>
        <div className="chat-card-comparison-period">&pound;2k-5k/mo &times; 12</div>
      </div>
      <div className="chat-card-comparison-col chat-card-comparison-col--hd">
        <div className="chat-card-comparison-label">AI Ad Engine</div>
        <div className="chat-card-comparison-price">&pound;497 one-time Trial</div>
        <div className="chat-card-comparison-period">Full setup included</div>
      </div>
      <div className="chat-card-comparison-note">
        Same price for {locationCount} location{locationCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

/* ────────── Timeline Card ────────── */
interface TimelineCardProps {
  onShow: () => void;
}

export function TimelineCard({ onShow }: TimelineCardProps) {
  useEffect(() => {
    onShow();
    track("card_shown", { card: "timeline" });
  }, [onShow]);

  const steps = [
    { time: "Today", desc: "Start your Trial", active: true },
    { time: "72 hours", desc: "First ads live", active: false },
    { time: "3 weeks", desc: "Performance report delivered", active: false },
  ];

  return (
    <div className="chat-card chat-card-timeline">
      <div className="chat-card-timeline-steps">
        {steps.map((step, i) => (
          <div key={i} className="chat-card-timeline-step">
            <div className={`chat-card-timeline-dot ${step.active ? "chat-card-timeline-dot--active" : "chat-card-timeline-dot--future"}`} />
            <div>
              <div className="chat-card-timeline-time">{step.time}</div>
              <div className="chat-card-timeline-desc">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── CTA Card ────────── */
interface CTACardProps {
  onShow: () => void;
}

export function CTACard({ onShow }: CTACardProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onShow();
    track("card_shown", { card: "cta" });
  }, [onShow]);

  return (
    <div className="chat-card chat-card-cta">
      <p className="chat-card-cta-text">Ready to start?</p>
      <button
        className="chat-card-btn"
        onClick={() => scrollToCheckout(setLoading)}
        disabled={loading}
      >
        Start Your Trial
      </button>
      <p className="chat-card-fine">Takes about 2 minutes</p>
    </div>
  );
}
