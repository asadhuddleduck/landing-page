import type { ReactNode } from "react";
import localFont from "next/font/local";

const inter = localFont({
  src: "../../../public/brand/huddle/inter-latin.woff2",
  variable: "--font-huddle-start",
  weight: "100 900",
  display: "swap",
});

export default function StartLayout({ children }: { children: ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
