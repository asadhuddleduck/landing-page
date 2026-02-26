"use client";

import { useCurrency } from "@/hooks/useCurrency";

interface ConvertedPriceProps {
  amountGBP: number;
  inline?: boolean;
}

export default function ConvertedPrice({ amountGBP, inline }: ConvertedPriceProps) {
  const { convert } = useCurrency();
  const converted = convert(amountGBP);
  if (!converted) return null;
  return <span className={inline ? "converted-price-inline" : "converted-price"}>{converted}</span>;
}
