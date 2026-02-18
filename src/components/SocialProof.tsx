const metrics = [
  { number: "15+", label: "locations", brand: "Phat Buns" },
  { number: "12,000", label: "followers", brand: "Dough Club" },
  { number: "4,000+", label: "attendees", brand: "Shakedown" },
  { number: "676", label: "enquiries", brand: "F&B Franchise" },
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
          </div>
        ))}
      </div>
    </section>
  );
}
