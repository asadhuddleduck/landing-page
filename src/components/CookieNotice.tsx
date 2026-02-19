"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hd_cookie_notice";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-notice">
      <div className="cookie-notice-inner">
        <p className="cookie-notice-text">
          We use cookies to measure ad performance and improve your experience.
        </p>
        <button onClick={dismiss} className="cookie-notice-btn">
          Got it
        </button>
      </div>
    </div>
  );
}
