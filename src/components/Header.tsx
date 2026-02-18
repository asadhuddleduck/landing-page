import Image from "next/image";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(0, 30, 43, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border)",
        boxShadow: "0 1px 30px rgba(30, 186, 143, 0.06)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/duck-logo.png"
            alt="Huddle Duck"
            width={36}
            height={36}
            className="rounded-lg transition-shadow duration-300 hover:shadow-[0_4px_25px_rgba(30,186,143,0.4)]"
            style={{ boxShadow: "0 4px 20px rgba(30,186,143,0.25)" }}
          />
          <span
            className="text-base md:text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Huddle Duck
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* F&B badge — desktop only */}
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:inline-block"
            style={{
              background: "var(--sandstorm-glow)",
              color: "var(--sandstorm)",
              border: "1px solid rgba(247, 206, 70, 0.2)",
            }}
          >
            For F&B Brands Only
          </span>

          {/* CTA — always visible */}
          <a
            href="#checkout"
            className="px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--gradient-accent)",
              color: "white",
              boxShadow: "0 2px 12px rgba(30, 186, 143, 0.25)",
            }}
          >
            Start Pilot
          </a>
        </div>
      </div>
    </header>
  );
}
