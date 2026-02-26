const caseStudies = [
  {
    brand: "Phat Buns",
    logo: "/logos/phatbuns.png",
    method: "AI campaigns launched across 15+ locations for a multi-location burger brand.",
    outcome: "Within days, their Uber Eats account manager called, stunned by the performance spike across every location.",
    quote: "\"What the hell have you guys done?\"",
    cite: "Uber Eats rep to Phat Buns",
  },
  {
    brand: "Shakedown",
    logo: "/logos/shakedown.png",
    method: "AI ad campaigns built and launched for a growing milkshake and burger brand.",
    outcome: "Demand outpaced what the kitchen could handle. Sam called and asked us to pause.",
    quote: "\"It was mental. We want to do more of this.\"",
    cite: "Sam, Shakedown",
  },
  {
    brand: "Burger & Sauce",
    logo: "/logos/burger-and-sauce.png",
    method: "Single £100 test campaign using AI-remade content from their existing social media.",
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
    method: "Franchise enquiry flow built using AI campaigns. Targeted qualified investors, filtered tyre-kickers.",
    outcome: "Client reported 676 franchise enquiries through the pipeline during the engagement.",
  },
  {
    brand: "Burger & Sauce",
    logo: "/logos/burger-and-sauce.png",
    method: "Full AI Ad Engine Trial delivered. Client asked to rate the experience.",
    outcome: "Perfect 10/10 NPS score. Praised communication, results, and accountability.",
    quote: "\"Is 20 an option?\"",
    cite: "Adam, Marketing Manager",
  },
  {
    brand: "Boo Burger",
    logo: "/logos/boo.png",
    logoH: 14,
    method: "AI ad campaigns delivered for a multi-location burger brand. Referred to us by another client.",
    outcome: "Perfect 10/10 NPS score. Then referred two more brands who became clients.",
  },
  {
    brand: "Phat Buns",
    logo: "/logos/phatbuns.png",
    method: "AI launch campaign for a new Liverpool location. Full campaign system deployed with ticket-based crowd management.",
    outcome: "Hit capacity after spending just 31% of the allocated marketing budget. The AI found the audience before the budget ran out.",
  },
];

export default function CaseStudies() {
  return (
    <section className="section case-studies">
      <h2 className="case-studies-title">What clients reported</h2>
      <p className="case-studies-subtitle">
        Every business is different. These are outcomes clients shared with us.
      </p>
      <div className="case-studies-grid">
        {caseStudies.map((cs, i) => (
          <div key={i} className="case-study-card">
            <p className="case-study-method">{cs.method}</p>
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
