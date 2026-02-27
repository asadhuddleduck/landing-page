"use client";

import { useState, useEffect } from "react";
import { detectCurrency, convertGBP, getDisplayPrice as getDisplayPriceLib } from "@/lib/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    // URL param override for testing: ?currency=USD
    const params = new URLSearchParams(window.location.search);
    const override = params.get("currency");
    if (override) {
      setCurrency(override.toUpperCase());
      return;
    }
    setCurrency(detectCurrency());
  }, []);

  const convert = (amountGBP: number, tier?: "trial" | "unlimited"): string | null => {
    if (!currency) return null;
    return convertGBP(amountGBP, currency, tier) || null;
  };

  /** Returns local-currency-first display price. Falls back to GBP if no currency detected. */
  const getDisplayPrice = (amountGBP: number, tier: "trial" | "unlimited") => {
    const code = currency || "GBP";
    return getDisplayPriceLib(amountGBP, code, tier);
  };

  return { currency, convert, getDisplayPrice };
}
