import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer">
      <Image
        src="/duck-logo.png"
        alt="Huddle Duck"
        width={28}
        height={28}
        className="footer-logo"
      />
      <p className="footer-text">
        &copy; {new Date().getFullYear()}{" "}
        <a href="https://huddleduck.co.uk" className="footer-link">
          Huddle Duck
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
