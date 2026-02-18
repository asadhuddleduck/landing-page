const metrics = [
  { number: "15+", label: "locations", brand: "Phat Buns", context: "International burger brand" },
  { number: "12,000", label: "followers pre-launch", brand: "Dough Club", context: "Sold out for weeks before opening" },
  { number: "4,000+", label: "launch attendees", brand: "Shakedown", context: "A city where nobody had heard of them" },
  { number: "676", label: "franchise enquiries", brand: "F&B Franchise", context: "At £12.56 each" },
];

export default function SocialProof() {
  return (
    <section className="section">
      <div className="social-proof">
        {metrics.map((m) => (
          <div key={m.brand} className="social-stat">
            <p className="social-stat-number">{m.number}</p>
            <p className="social-stat-label">{m.label}</p>
            <p className="social-stat-brand">{m.brand}</p>
            <p className="social-stat-context">{m.context}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
