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
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 py-3 sm:px-6"
      style={{
        background: "rgba(0, 30, 43, 0.97)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <p
          className="text-xs sm:text-sm flex-1 text-center sm:text-left"
          style={{ color: "var(--text-secondary)" }}
        >
          We use cookies to measure ad performance and improve your experience.
        </p>
        <button
          onClick={dismiss}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 flex-shrink-0"
          style={{
            background: "var(--viridian)",
            color: "white",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
