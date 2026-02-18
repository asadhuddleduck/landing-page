import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(0, 30, 43, 0.85)", borderColor: "var(--border)" }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/duck-logo.png"
            alt="Huddle Duck"
            width={40}
            height={40}
            className="rounded-lg"
            style={{ boxShadow: "0 4px 20px rgba(30,186,143,0.3)" }}
          />
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Huddle Duck
          </span>
        </div>

        <span
          className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:inline-block"
          style={{
            background: "var(--sandstorm-glow)",
            color: "var(--sandstorm)",
            border: "1px solid rgba(247, 206, 70, 0.25)",
          }}
        >
          For F&B Brands Only
        </span>
      </div>
    </header>
  );
}
