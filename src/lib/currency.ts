// Static exchange rates from GBP (approximate, for display only)
// Actual Stripe charge is always in GBP
const EXCHANGE_RATES: Record<string, number> = {
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
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  AUD: "A$",
  CAD: "C$",
  AED: "\u062F.\u0625",
  SGD: "S$",
  INR: "\u20B9",
  ZAR: "R",
  NZD: "NZ$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  JPY: "\u00A5",
  HKD: "HK$",
  MYR: "RM",
  PLN: "z\u0142",
  BRL: "R$",
  MXN: "MX$",
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
  if (lang === "pt") return "BRL";
  if (lang === "ja") return "JPY";
  if (lang === "zh") return "HKD";
  if (lang === "hi") return "INR";
  if (lang === "ar") return "AED";
  if (lang === "sv") return "SEK";
  if (lang === "nb" || lang === "nn" || lang === "no") return "NOK";
  if (lang === "da") return "DKK";
  if (lang === "pl") return "PLN";
  if (lang === "ms") return "MYR";

  return null;
}

/**
 * Returns the display symbol for a currency code.
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Converts a GBP amount to a formatted local currency string.
 * Returns a string like "~ $631 USD" or "~ ¥94,549 JPY".
 */
export function convertGBP(amountGBP: number, currencyCode: string): string {
  const rate = EXCHANGE_RATES[currencyCode];
  if (!rate) return "";

  const converted = Math.round(amountGBP * rate);
  const symbol = getCurrencySymbol(currencyCode);

  // Format with commas for readability
  const formatted = converted.toLocaleString("en-US");

  return `~ ${symbol}${formatted} ${currencyCode}`;
}
