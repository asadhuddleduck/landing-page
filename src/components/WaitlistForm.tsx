"use client";

import { useState } from "react";
import { getStoredUtms, getFbCookies } from "@/lib/visitor";
import PriorityForm from "./PriorityForm";

type Variant = "hero" | "inline";

interface Props {
  variant?: Variant;
}

interface Stage1State {
  personName: string;
  email: string;
  phone: string;
  whatsapp: string;
  businessName: string;
  instagram: string;
  tiktok: string;
  city: string;
  briefInfo: string;
  // honeypot
  website_url_confirm: string;
}

const empty: Stage1State = {
  personName: "",
  email: "",
  phone: "",
  whatsapp: "",
  businessName: "",
  instagram: "",
  tiktok: "",
  city: "",
  briefInfo: "",
  website_url_confirm: "",
};

export default function WaitlistForm({ variant = "hero" }: Props) {
  const [form, setForm] = useState<Stage1State>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPriority, setShowPriority] = useState(false);

  function set<K extends keyof Stage1State>(key: K, value: Stage1State[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.personName.trim() || !form.email.trim() || !form.businessName.trim()) {
      setError("Name, email and business name are required.");
      return;
    }

    setSubmitting(true);

    const utms = getStoredUtms();
    const { fbc, fbp } = getFbCookies();

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: form.personName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          whatsapp: form.whatsapp.trim() || undefined,
          businessName: form.businessName.trim(),
          instagram: form.instagram.trim() || undefined,
          tiktok: form.tiktok.trim() || undefined,
          city: form.city.trim() || undefined,
          briefInfo: form.briefInfo.trim() || undefined,
          utmSource: utms.utm_source,
          utmMedium: utms.utm_medium,
          utmCampaign: utms.utm_campaign,
          fbc: fbc ?? undefined,
          fbp: fbp ?? undefined,
          website_url_confirm: form.website_url_confirm,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={`waitlist-card waitlist-card--${variant}`}>
        <div className="waitlist-success">
          <div className="waitlist-success-title">You&apos;re on the list.</div>
          <p className="waitlist-success-body">
            We&apos;ll review your details and get back to you when a spot opens.
          </p>
          {!showPriority && (
            <button
              type="button"
              className="waitlist-priority-toggle"
              onClick={() => setShowPriority(true)}
            >
              Want to jump the queue? Answer 7 quick questions →
            </button>
          )}
          {showPriority && <PriorityForm email={form.email.trim()} />}
        </div>
      </div>
    );
  }

  return (
    <form className={`waitlist-card waitlist-card--${variant}`} onSubmit={onSubmit} noValidate>
      <div className="waitlist-grid">
        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="wl-name">Your name</label>
          <input
            id="wl-name"
            type="text"
            autoComplete="name"
            required
            value={form.personName}
            onChange={(e) => set("personName", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="wl-email">Email</label>
          <input
            id="wl-email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="wl-phone">Phone</label>
          <input
            id="wl-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            disabled={submitting}
            placeholder="+44 …"
          />
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="wl-whatsapp">WhatsApp <span className="waitlist-optional">(if different)</span></label>
          <input
            id="wl-whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            disabled={submitting}
            placeholder="+44 …"
          />
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="wl-business">Business name</label>
          <input
            id="wl-business"
            type="text"
            autoComplete="organization"
            required
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="wl-ig">Instagram URL</label>
          <input
            id="wl-ig"
            type="url"
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            disabled={submitting}
            placeholder="https://instagram.com/…"
          />
        </div>

        <div className="waitlist-field">
          <label htmlFor="wl-tiktok">TikTok URL</label>
          <input
            id="wl-tiktok"
            type="url"
            value={form.tiktok}
            onChange={(e) => set("tiktok", e.target.value)}
            disabled={submitting}
            placeholder="https://tiktok.com/@…"
          />
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="wl-city">City / area</label>
          <input
            id="wl-city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="waitlist-field waitlist-field--full">
          <label htmlFor="wl-brief">What does your business do?</label>
          <textarea
            id="wl-brief"
            rows={3}
            value={form.briefInfo}
            onChange={(e) => set("briefInfo", e.target.value)}
            disabled={submitting}
            maxLength={1000}
          />
        </div>

        {/* Honeypot — hidden from users, bots fill it */}
        <input
          type="text"
          name="website_url_confirm"
          tabIndex={-1}
          autoComplete="off"
          value={form.website_url_confirm}
          onChange={(e) => set("website_url_confirm", e.target.value)}
          className="waitlist-honeypot"
          aria-hidden="true"
        />
      </div>

      {error && <div className="waitlist-error">{error}</div>}

      <button type="submit" className="waitlist-submit" disabled={submitting}>
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>

      <p className="waitlist-fineprint">
        We only take on businesses we can move the needle for. Joining the waitlist means
        we&apos;ll review and reach out — no payment, no commitment.
      </p>
    </form>
  );
}
