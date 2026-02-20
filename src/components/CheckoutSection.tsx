"use client";

import { useState, useRef } from "react";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";
import PaymentForm from "./PaymentForm";

const steps = [
  "AI deep-researches your audience",
  "Your real content remade into ads",
  "3 weeks managed, then you decide",
];

const features = [
  "Deep audience research from social data & competitor analysis",
  "Ad creative remade from your existing content",
  "Full AI campaign setup & 3-week managed run",
  "Tracking report & strategy review call",
  "Ad spend not included - recommended 1x your AOV per day per location",
];

type CheckoutStep = "idle" | "details" | "paying" | "success";

export default function CheckoutSection() {
  const [step, setStep] = useState<CheckoutStep>("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  function handleStartCheckout() {
    trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
    track("checkout_click");
    setStep("details");
    // Scroll the form into view after a tick
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
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

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          visitor_id: vid,
          ...utms,
        }),
      });

      const data = await res.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setStep("paying");
        setTimeout(() => {
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      } else {
        console.error("[checkout] No client secret returned:", data);
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("[checkout] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="checkout" className="section">
      <div className="checkout-card">
        <p className="checkout-label">AI Ad Engine Pilot</p>

        <div className="checkout-price">
          <span className="checkout-currency">£</span>
          <span className="checkout-amount">497</span>
        </div>
        <p className="checkout-payment-type">one-time payment</p>

        <hr className="checkout-divider" />

        {/* How it works — always visible */}
        <p className="checkout-steps-label">How it works</p>
        <div className="checkout-steps">
          {steps.map((s, i) => (
            <div key={s} className="checkout-step">
              <span className="checkout-step-num">{i + 1}</span>
              <span className="checkout-step-text">{s}</span>
            </div>
          ))}
        </div>

        {/* Features — show only in idle state */}
        {step === "idle" && (
          <div className="checkout-features">
            {features.map((feature) => (
              <div key={feature} className="checkout-feature">
                <svg
                  className="checkout-check"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* IDLE: Show the start button */}
        {step === "idle" && (
          <>
            <button onClick={handleStartCheckout} className="checkout-btn">
              Start Your Pilot
            </button>
            <div className="checkout-trust">
              <span>Powered by</span>
              <svg className="checkout-trust-stripe" viewBox="18 10 88 36" fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg">
                <path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" />
              </svg>
            </div>
          </>
        )}

        {/* DETAILS: Contact form */}
        {(step === "details" || step === "paying") && (
          <div ref={formRef} className="checkout-form">
            {step === "details" ? (
              <form onSubmit={handleContinueToPayment}>
                <p className="checkout-form-heading">Your details</p>
                <div className="checkout-field">
                  <label htmlFor="checkout-email" className="checkout-form-label">
                    Email *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="checkout-input"
                    autoComplete="email"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-name" className="checkout-form-label">
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="checkout-input"
                    autoComplete="name"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-phone" className="checkout-form-label">
                    Phone
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="checkout-input"
                    autoComplete="tel"
                  />
                </div>
                {error && <p className="checkout-error">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="checkout-btn"
                  style={{ marginTop: "20px" }}
                >
                  {loading ? "Setting up..." : "Continue to Payment"}
                </button>
                <div className="checkout-trust">
                  <span>Powered by</span>
                  <svg className="checkout-trust-stripe" viewBox="18 10 88 36" fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg">
                    <path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" />
                  </svg>
                </div>
              </form>
            ) : (
              <>
                {/* PAYING: Show locked contact details + Payment Element */}
                <div className="checkout-contact-summary">
                  <p className="checkout-form-heading">Your details</p>
                  <p className="checkout-contact-line">{email}</p>
                  {name && (
                    <p className="checkout-contact-line">{name}</p>
                  )}
                  {phone && (
                    <p className="checkout-contact-line">{phone}</p>
                  )}
                  <button
                    type="button"
                    className="checkout-edit-btn"
                    onClick={() => {
                      setStep("details");
                      setClientSecret("");
                      setPaymentIntentId("");
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="checkout-payment-section">
                  <p className="checkout-form-heading">Payment</p>
                  <PaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* SUCCESS: Inline confirmation */}
        {step === "success" && (
          <div className="checkout-success">
            <div className="checkout-success-icon">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="checkout-success-title">You&apos;re in!</p>
            <p className="checkout-success-text">
              Check your inbox for a welcome email. Akmal will reach out within
              24 hours.
            </p>
          </div>
        )}
      </div>

      {/* Credit guarantee badge — below the card */}
      {step !== "success" && (
        <div className="guarantee-badge">
          <div className="guarantee-badge-shield">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="guarantee-badge-content">
            <p className="guarantee-badge-label">CREDIT GUARANTEE</p>
            <p className="guarantee-badge-text">Your pilot fee is fully credited when you upgrade.</p>
          </div>
        </div>
      )}
    </section>
  );
}
