// Static exchange rates from GBP
//
// HOW TO UPDATE: Replace rates below with current GBP→X rates from xe.com,
// then update RATES_LAST_UPDATED. Aim to refresh every 2-3 months.
export const RATES_LAST_UPDATED = "2026-02-27";

// Currencies where 1 unit = smallest unit (no cents). Don't multiply by 100.
export const ZERO_DECIMAL_CURRENCIES = new Set(["JPY"]);

// Buffer applied to Unlimited tier for non-GBP to cover Stripe 2% FX fee + margin
export const FX_BUFFER = 0.05;

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.27,
  EUR: 1.17,
  AUD: 1.94,
  CAD: 1.72,
  AED: 4.67,
  SGD: 1.70,
  INR: 105.5,
  ZAR: 23.1,
  NZD: 2.11,
  CHF: 1.13,
  SEK: 13.3,
  NOK: 13.5,
  DKK: 8.73,
  JPY: 190.5,
  HKD: 9.93,
  MYR: 5.99,
  PLN: 5.11,
  BRL: 7.35,
  MXN: 21.8,
  PKR: 377,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "\u20AC",
  AUD: "A$",
  CAD: "C$",
  AED: "AED\u00A0",
  SGD: "S$",
  INR: "\u20B9",
  ZAR: "R",
  NZD: "NZ$",
  CHF: "CHF\u00A0",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  JPY: "\u00A5",
  HKD: "HK$",
  MYR: "RM",
  PLN: "z\u0142",
  BRL: "R$",
  MXN: "MX$",
  PKR: "Rs",
};

// Maps navigator.language locale to currency code
const LOCALE_TO_CURRENCY: Record<string, string> = {
  "en-US": "USD",
  "en-AU": "AUD",
  "en-CA": "CAD",
  "en-NZ": "NZD",
  "en-ZA": "ZAR",
  "en-SG": "SGD",
  "en-HK": "HKD",
  "en-MY": "MYR",
  "en-IN": "INR",
  "en-AE": "AED",
  "en-IE": "EUR",
  "de-DE": "EUR",
  "de-AT": "EUR",
  "fr-FR": "EUR",
  "fr-BE": "EUR",
  "it-IT": "EUR",
  "es-ES": "EUR",
  "nl-NL": "EUR",
  "nl-BE": "EUR",
  "pt-PT": "EUR",
  "fi-FI": "EUR",
  "el-GR": "EUR",
  "et-EE": "EUR",
  "lv-LV": "EUR",
  "lt-LT": "EUR",
  "sk-SK": "EUR",
  "sl-SI": "EUR",
  "mt-MT": "EUR",
  "pt-BR": "BRL",
  "es-MX": "MXN",
  "es-AR": "USD",
  "es-CO": "USD",
  "es-CL": "USD",
  "ja-JP": "JPY",
  "zh-HK": "HKD",
  "zh-SG": "SGD",
  "ms-MY": "MYR",
  "hi-IN": "INR",
  "ar-AE": "AED",
  "sv-SE": "SEK",
  "nb-NO": "NOK",
  "nn-NO": "NOK",
  "da-DK": "DKK",
  "de-CH": "CHF",
  "fr-CH": "CHF",
  "it-CH": "CHF",
  "pl-PL": "PLN",
  "ur-PK": "PKR",
  "en-PK": "PKR",
};

/**
 * Detects the visitor's likely currency from navigator.language.
 * Returns null for en-GB (no conversion needed) or unknown locales.
 */
export function detectCurrency(): string | null {
  if (typeof navigator === "undefined") return null;

  const locale = navigator.language;

  // en-GB visitors see nothing extra
  if (locale === "en-GB") return null;

  // Exact match first
  if (LOCALE_TO_CURRENCY[locale]) {
    return LOCALE_TO_CURRENCY[locale];
  }

  // Try language-only fallback for common cases
  const lang = locale.split("-")[0];
  if (lang === "en") return "USD"; // Default English to USD
  if (lang === "de") return "EUR";
  if (lang === "fr") return "EUR";
  if (lang === "it") return "EUR";
  if (lang === "es") return "EUR";
  if (lang === "nl") return "EUR";
  if (lang === "pt") return "EUR";
  if (lang === "ja") return "JPY";
  if (lang === "zh") return "HKD";
  if (lang === "hi") return "INR";
  if (lang === "ar") return "AED";
  if (lang === "sv") return "SEK";
  if (lang === "nb" || lang === "nn" || lang === "no") return "NOK";
  if (lang === "da") return "DKK";
  if (lang === "pl") return "PLN";
  if (lang === "ms") return "MYR";
  if (lang === "ur") return "PKR";

  return null;
}

/**
 * Returns the display symbol for a currency code.
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Charm-rounds a raw converted price so it looks intentional, not calculated.
 *
 * Trial tier: ends in 7 (< 1 000) or 97 (≥ 1 000) — e.g. $627, AED 2,297
 * Unlimited:  rounds to nearest 50 / 500 / 5 000 depending on magnitude
 */
export function charmRound(raw: number, tier: "trial" | "unlimited"): number {
  if (tier === "trial") {
    if (raw < 1_000) {
      // Nearest number ending in 7  (…7, …17, …27, …637, …967)
      return Math.round((raw - 7) / 10) * 10 + 7;
    }
    // Nearest number ending in 97  (…97, …197, …1 097, …52 397)
    return Math.round((raw - 97) / 100) * 100 + 97;
  }

  // Unlimited: clean round numbers that scale with magnitude
  if (raw < 5_000) return Math.round(raw / 50) * 50;
  if (raw < 50_000) return Math.round(raw / 500) * 500;
  return Math.round(raw / 5_000) * 5_000;
}

/**
 * Converts a GBP amount to a formatted local currency string.
 * Returns a string like "~ $627 USD" or "~ ¥250,000 JPY".
 *
 * Pass `tier` to apply charm rounding. Without it, raw Math.round is used.
 */
export function convertGBP(
  amountGBP: number,
  currencyCode: string,
  tier?: "trial" | "unlimited",
): string {
  const rate = EXCHANGE_RATES[currencyCode];
  if (!rate) return "";

  const raw = amountGBP * rate;
  const converted = tier ? charmRound(raw, tier) : Math.round(raw);
  const symbol = getCurrencySymbol(currencyCode);

  // Format with commas for readability
  const formatted = converted.toLocaleString("en-US");

  return `~ ${symbol}${formatted} ${currencyCode}`;
}

/**
 * Returns a display-ready local price for a GBP amount.
 *
 * Trial: charm-rounded, no buffer (Adaptive Pricing handles FX)
 * Unlimited: charm-rounded WITH 5% buffer (covers Stripe FX fee + margin)
 * GBP: returns the GBP price directly
 */
export function getDisplayPrice(
  amountGBP: number,
  currencyCode: string,
  tier: "trial" | "unlimited",
): { amount: number; symbol: string; formatted: string } {
  if (currencyCode === "GBP") {
    const formatted = amountGBP.toLocaleString("en-GB");
    return { amount: amountGBP, symbol: "£", formatted: `£${formatted}` };
  }

  const rate = EXCHANGE_RATES[currencyCode];
  if (!rate) {
    const formatted = amountGBP.toLocaleString("en-GB");
    return { amount: amountGBP, symbol: "£", formatted: `£${formatted}` };
  }

  const raw = tier === "unlimited"
    ? amountGBP * rate * (1 + FX_BUFFER)
    : amountGBP * rate;

  const amount = charmRound(raw, tier);
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = `${symbol}${amount.toLocaleString("en-US")}`;

  return { amount, symbol, formatted };
}

/**
 * Returns the charge amount in Stripe's smallest currency unit.
 * For most currencies: amount × 100 (cents). For zero-decimal (JPY): amount as-is.
 *
 * Used for Unlimited non-GBP price_data. Trial uses Adaptive Pricing, GBP uses Price IDs.
 */
export function getChargeAmountInSmallestUnit(
  amountGBP: number,
  currencyCode: string,
  tier: "trial" | "unlimited",
): number {
  const { amount } = getDisplayPrice(amountGBP, currencyCode, tier);
  return ZERO_DECIMAL_CURRENCIES.has(currencyCode) ? amount : amount * 100;
}
