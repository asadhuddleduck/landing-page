"use client";

import { useEffect, useState } from "react";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

// Shared checkout handler used by PricingCard and CTACard
async function handleCheckout(setLoading: (v: boolean) => void) {
  setLoading(true);
  try {
    trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
    track("card_cta_click");

    const vid = getVisitorId();
    const params = new URLSearchParams(window.location.search);
    const utms = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    };
    if (!utms.utm_source) {
      const stored = getStoredUtms();
      utms.utm_source = stored.utm_source || "";
      utms.utm_medium = stored.utm_medium || "";
      utms.utm_campaign = stored.utm_campaign || "";
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: vid, ...utms }),
    });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("[chat-card] No URL returned:", data);
      setLoading(false);
    }
  } catch (err) {
    console.error("[chat-card] Error:", err);
    setLoading(false);
  }
}

/* ────────── Pricing Card ────────── */
interface PricingCardProps {
  onShow: () => void;
}

export function PricingCard({ onShow }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onShow();
    track("card_shown", { card: "pricing" });
  }, [onShow]);

  return (
    <div className="chat-card chat-card-pricing">
      <div className="chat-card-header">
        <span className="chat-card-label">AI Ad Engine Pilot</span>
        <div className="chat-card-price">
          <span className="chat-card-currency">£</span>
          <span className="chat-card-amount">497</span>
          <span className="chat-card-period">one-time</span>
        </div>
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
          <span>Tracking report and strategy review</span>
        </div>
      </div>
      <button
        className="chat-card-btn"
        onClick={() => handleCheckout(setLoading)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Start Your Pilot"}
      </button>
      <p className="chat-card-fine">Credited if you upgrade within 30 days</p>
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
    quote: "Their Uber Eats rep called asking what happened. Sales spiked every location.",
    brand: "Phat Buns",
    detail: "15+ locations",
  },
  burger_sauce: {
    quote: "Hundreds of new customers in 8 days.",
    brand: "Burger & Sauce",
    detail: "Multi-location",
  },
  franchise: {
    quote: "676 qualified enquiries. 62 with six-figure capital.",
    brand: "Franchise Campaign",
    detail: "F&B brand",
  },
};

function pickTestimonial(agentText: string): TestimonialMeta {
  const lower = agentText.toLowerCase();
  if (lower.includes("phat buns")) return TESTIMONIALS.phat_buns;
  if (lower.includes("burger & sauce") || lower.includes("burger and sauce"))
    return TESTIMONIALS.burger_sauce;
  if (lower.includes("676")) return TESTIMONIALS.franchise;
  return TESTIMONIALS.phat_buns; // default
}

interface TestimonialCardProps {
  text: string;
  onShow: () => void;
}

export function TestimonialCard({ text, onShow }: TestimonialCardProps) {
  const testimonial = pickTestimonial(text);

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
        onClick={() => handleCheckout(setLoading)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Start Your Pilot"}
      </button>
      <p className="chat-card-fine">Takes about 2 minutes</p>
    </div>
  );
}
