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
          <button onClick={handleStartCheckout} className="checkout-btn">
            Start Your Pilot
          </button>
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

        {/* Fine print — always visible except success */}
        {step !== "success" && (
          <>
            <p className="checkout-fine-print">
              A mutual trial. You see what it can do. It learns if you&apos;re a
              fit.
            </p>
            <p className="checkout-credit">
              £497 fully credited if you upgrade within 30 days.
            </p>
          </>
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
    </section>
  );
}
