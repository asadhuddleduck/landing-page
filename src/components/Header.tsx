import Image from "next/image";

export default function Header() {
  return (
    <header className="header">
      <Image
        src="/duck-logo.png"
        alt="Huddle Duck"
        width={32}
        height={32}
        className="header-logo"
      />
    </header>
  );
}
