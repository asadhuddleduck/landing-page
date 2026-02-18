import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="relative z-10 py-10 px-4 md:py-12 md:px-6 text-center"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <Image
        src="/duck-logo.png"
        alt="Huddle Duck"
        width={28}
        height={28}
        className="mx-auto mb-3 rounded-lg opacity-40"
      />

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://huddleduck.co.uk"
          className="font-medium hover:underline transition-colors duration-200"
          style={{ color: "var(--viridian)" }}
        >
          Huddle Duck
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
