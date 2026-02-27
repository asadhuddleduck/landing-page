"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "hd_cookie_consent";
const LEGACY_KEY = "hd_cookie_notice";

function updateConsent(granted: boolean) {
  const state = granted ? "granted" : "denied";
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }
}

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    const legacy = localStorage.getItem(LEGACY_KEY);

    if (consent) return; // already answered

    if (legacy) {
      // Migrate old "Got it" users as granted
      localStorage.setItem(CONSENT_KEY, "granted");
      return;
    }

    setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "granted");
    updateConsent(true);
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "denied");
    updateConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-notice">
      <div className="cookie-notice-inner">
        <p className="cookie-notice-text">
          This site uses cookies to measure ad performance and improve your experience.
        </p>
        <div className="cookie-notice-actions">
          <button onClick={decline} className="cookie-notice-btn cookie-notice-btn--decline">
            No thanks
          </button>
          <button onClick={accept} className="cookie-notice-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
