import type { Metadata, Viewport } from "next";
import { Lato, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Join the waitlist | Huddle Duck",
  description:
    "AI ads for local businesses, done for you. We onboard new clients in waves — tell us about your business and we'll bring you in if it's a fit.",
  metadataBase: new URL("https://start.huddleduck.co.uk"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "AI ads for local businesses, done for you.",
    description:
      "Join the Huddle Duck waitlist. We onboard new clients in waves — tell us about your business and we'll bring you in if it's a fit.",
    url: "https://start.huddleduck.co.uk",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Huddle Duck — AI ads for local businesses",
      },
    ],
    siteName: "Huddle Duck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI ads for local businesses, done for you.",
    description:
      "Join the Huddle Duck waitlist. We onboard new clients in waves.",
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
      <body className={`${lato.variable} ${caveat.variable} ${lato.className}`}>
        {children}
        <TrackingScript />
        <MetaPixel />
        <CookieNotice />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              var c = localStorage.getItem('hd_cookie_consent') || (localStorage.getItem('hd_cookie_notice') ? 'granted' : '');
              var s = c === 'granted' ? 'granted' : 'denied';
              gtag('consent', 'default', {
                analytics_storage: s,
                ad_storage: s,
                ad_user_data: s,
                ad_personalization: s,
              });
            `,
          }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
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
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
