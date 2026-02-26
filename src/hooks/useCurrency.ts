"use client";

import { useState, useEffect } from "react";
import { detectCurrency, convertGBP } from "@/lib/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  const convert = (amountGBP: number): string | null => {
    if (!currency) return null;
    return convertGBP(amountGBP, currency);
  };

  return { currency, convert };
}
