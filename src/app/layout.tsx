import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import TrackingScript from "@/components/TrackingScript";
import MetaPixel from "@/components/MetaPixel";
import CookieNotice from "@/components/CookieNotice";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "AI Ad Engine for F&B Brands | Huddle Duck",
  description:
    "AI that makes sure everyone near your restaurant knows about you. 3-week managed pilot for £497.",
  metadataBase: new URL("https://start.huddleduck.co.uk"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "AI Ad Engine for F&B Brands | Huddle Duck",
    description:
      "AI that makes sure everyone near your restaurant knows about you. 3-week managed pilot for £497.",
    url: "https://start.huddleduck.co.uk",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Huddle Duck AI Ad Engine",
      },
    ],
    siteName: "Huddle Duck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Ad Engine for F&B Brands | Huddle Duck",
    description:
      "AI that makes sure everyone near your restaurant knows about you. 3-week managed pilot for £497.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${lato.className}`}>
        {children}
        <TrackingScript />
        <MetaPixel />
        <CookieNotice />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "Huddle Duck",
                  url: "https://huddleduck.co.uk",
                  logo: "https://start.huddleduck.co.uk/duck-logo.png",
                },
                {
                  "@type": "Product",
                  name: "AI Ad Engine Pilot",
                  description:
                    "AI that makes sure everyone near your restaurant knows about you. Deep audience research, real content remade into ads, 3-week managed pilot.",
                  offers: {
                    "@type": "Offer",
                    price: "497",
                    priceCurrency: "GBP",
                    availability: "https://schema.org/InStock",
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
