import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import TrackingScript from "@/components/TrackingScript";
import MetaPixel from "@/components/MetaPixel";
import CookieNotice from "@/components/CookieNotice";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AI Ad Engine for F&B Brands | Huddle Duck",
  description:
    "The AI-powered advertising engine built for restaurants, cafes, and food brands. Get a 4-week managed Meta ads pilot for just £497.",
  metadataBase: new URL("https://start.huddleduck.co.uk"),
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "AI Ad Engine for F&B Brands | Huddle Duck",
    description:
      "The AI-powered advertising engine built for restaurants, cafes, and food brands. Get a 4-week managed Meta ads pilot for just £497.",
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
      "The AI-powered advertising engine built for restaurants, cafes, and food brands. Get a 4-week managed Meta ads pilot for just £497.",
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
      <body className={inter.className}>
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
                    "4-week managed Meta ads pilot for F&B brands. AI-powered strategy, creative, and optimisation.",
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
