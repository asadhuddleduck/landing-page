import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 py-10 px-4 md:py-12 md:px-6 text-center">
      {/* Gradient divider */}
      <div
        className="mb-8 mx-auto h-px max-w-xs"
        style={{
          background: "linear-gradient(90deg, transparent, var(--viridian), transparent)",
          opacity: 0.4,
        }}
      />

      <Image
        src="/duck-logo.png"
        alt="Huddle Duck"
        width={32}
        height={32}
        className="mx-auto mb-3 rounded-lg opacity-50 transition-opacity duration-200 hover:opacity-80"
        style={{ filter: "drop-shadow(0 0 8px rgba(30, 186, 143, 0.2))" }}
      />

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://huddleduck.co.uk"
          className="font-semibold hover:underline transition-colors duration-200"
          style={{ color: "var(--viridian)" }}
        >
          Huddle Duck
        </a>
        . All rights reserved.
      </p>

      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
        Built with AI
      </p>
    </footer>
  );
}
