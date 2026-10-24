"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { EXCHANGE_RATES, getCurrencySymbol } from "@/lib/currency";

const caseStudies = [
  {
    brand: "Phat Buns",
    logo: "/logos/phatbuns.png",
    method: "Campaigns launched across 15+ locations for a multi-location burger brand.",
    outcome: "Within days, their Uber Eats account manager called, stunned by the performance spike across every location.",
    quote: "\"What the hell have you guys done?\"",
    cite: "Uber Eats rep to Phat Buns",
  },
  {
    brand: "Shakedown",
    logo: "/logos/shakedown.png",
    method: "Ad campaigns planned, made and launched for a growing milkshake and burger brand.",
    outcome: "Demand outpaced what the kitchen could handle. Sam called and asked us to pause.",
    quote: "\"It was mental. We want to do more of this.\"",
    cite: "Sam, Shakedown",
  },
  {
    brand: "Burger & Sauce",
    logo: "/logos/burger-and-sauce.png",
    method: "Single £100 test campaign, re-edited from content already on their social media.",
    outcome: "Client reported strong customer response. Repeat visits followed. They stayed on.",
  },
  {
    brand: "Shakedown",
    logo: "/logos/shakedown.png",
    method: "Pre-launch awareness campaigns run before every new location opening. Zero brand awareness in each city.",
    outcome: "Client reported scaling from 1 to 5 locations. Over 4,000 attended the Newcastle launch alone.",
  },
  {
    brand: "Dough Club",
    logo: "/logos/doughclub-new.png",
    method: "Pre-launch follower campaigns from zero. Optimised for local followers, not sales. The restaurant didn't exist yet.",
    outcome: "Client reported 12,000 followers before their first pizza was served. Sold out for weeks after opening.",
  },
  {
    brand: "Chai Green",
    logo: "/logos/chai-green.png",
    method: "Franchise enquiry campaigns aimed at serious investors, with time-wasters filtered out.",
    outcome: "Client reported 676 franchise enquiries during the engagement.",
  },
  {
    brand: "Burger & Sauce",
    logo: "/logos/burger-and-sauce.png",
    method: "Full ad campaign run end to end. Client asked to rate the experience.",
    outcome: "Perfect 10/10 NPS score. Praised communication, results, and accountability.",
    quote: "\"Is 20 an option?\"",
    cite: "Adam, Marketing Manager",
  },
  {
    brand: "Boo Burger",
    logo: "/logos/boo.png",
    logoH: 14,
    method: "Ad campaigns run for a multi-location burger brand. Referred to us by another client.",
    outcome: "Perfect 10/10 NPS score. Then referred two more brands who became clients.",
  },
  {
    brand: "Phat Buns",
    logo: "/logos/phatbuns.png",
    method: "Launch campaign for a new Liverpool location, with ticketed entry to manage the crowd.",
    outcome: "Hit capacity after spending just 31% of the budget. We found the right people before the money ran out.",
  },
];

export default function CaseStudies() {
  const { currency } = useCurrency();

  // Convert £ amounts in case study text for non-GBP visitors
  function convertText(text: string): string {
    if (!currency || currency === "GBP") return text;
    const rate = EXCHANGE_RATES[currency];
    if (!rate) return text;
    const sym = getCurrencySymbol(currency);
    // £100 → clean round number in local currency
    return text.replace(/£100/g, () => {
      const raw = 100 * rate;
      const rounded = raw < 1000 ? Math.round(raw / 10) * 10 : Math.round(raw / 100) * 100;
      return `${sym}${rounded.toLocaleString("en-US")}`;
    });
  }

  return (
    <section className="section case-studies">
      <h2 className="case-studies-title">What clients reported</h2>
      <p className="case-studies-subtitle">
        Every business is different. These are outcomes clients shared with us.
      </p>
      <div className="case-studies-grid">
        {caseStudies.map((cs, i) => (
          <div key={i} className="case-study-card">
            <p className="case-study-method">{convertText(cs.method)}</p>
            <p className="case-study-outcome">{cs.outcome}</p>
            {cs.quote && <p className="case-study-quote">{cs.quote}</p>}
            {cs.cite && <p className="case-study-cite">{cs.cite}</p>}
            <div className="case-study-attribution">
              {cs.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cs.logo} alt={cs.brand} className="case-study-logo" style={cs.logoH ? { height: `${cs.logoH}px` } : undefined} />
              )}
              <span className="case-study-brand">{cs.brand}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
