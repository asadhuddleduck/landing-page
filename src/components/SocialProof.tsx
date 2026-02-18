const metrics = [
  { number: "15+", label: "locations" },
  { number: "12K", label: "pre-launch followers" },
  { number: "4,000+", label: "launch attendees" },
  { number: "676", label: "franchise enquiries" },
];

export default function SocialProof() {
  return (
    <section className="section social-proof-section">
      <div className="social-proof-strip">
        {metrics.map((m, i) => (
          <div key={m.label} className="social-proof-item">
            <span className="social-proof-number">{m.number}</span>
            <span className="social-proof-label">{m.label}</span>
            {i < metrics.length - 1 && <span className="social-proof-divider" />}
          </div>
        ))}
      </div>
    </section>
  );
}
