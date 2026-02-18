import Image from "next/image";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(5, 5, 5, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <Image
            src="/duck-logo.png"
            alt="Huddle Duck"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span
            className="text-sm md:text-base font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Huddle Duck
          </span>
        </div>

        {/* Ghost CTA */}
        <a
          href="#checkout"
          className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 hover:scale-105"
          style={{
            background: "transparent",
            color: "var(--viridian)",
            border: "1px solid var(--border)",
          }}
        >
          Start Pilot
        </a>
      </div>
    </header>
  );
}
