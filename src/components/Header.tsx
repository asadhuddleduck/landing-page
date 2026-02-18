import Image from "next/image";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <Image
          src="/duck-logo.png"
          alt="Huddle Duck"
          width={32}
          height={32}
          className="header-logo"
        />
        <span className="header-brand">Huddle Duck</span>
      </div>
      <a href="#checkout" className="header-cta">
        Start Pilot
      </a>
    </header>
  );
}
