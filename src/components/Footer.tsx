import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="relative z-10 py-12 px-6 text-center"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <Image
        src="/duck-logo.png"
        alt="Huddle Duck"
        width={32}
        height={32}
        className="mx-auto mb-3 rounded-lg opacity-60"
      />
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://huddleduck.co.uk"
          className="font-semibold hover:underline"
          style={{ color: "var(--viridian)" }}
        >
          Huddle Duck
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
