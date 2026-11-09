import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./mr-asad.css";

// asadshah.co.uk: the MR. ASAD site. No Huddle Duck trackers, cookie notice or
// structured data load here; private booking links travel in the URL fragment.
export const metadata: Metadata = {
  metadataBase: new URL("https://asadshah.co.uk"),
  title: "MR. ASAD | talk to Asad about your marketing",
  description:
    "a private one to one call with Asad about your ads, your offer or your next move. from £250.",
  icons: { icon: "/brand/mr-asad/icon.png", apple: "/brand/mr-asad/icon.png" },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#101214",
};

export default function AsadLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="ma-site">{children}</div>;
}
