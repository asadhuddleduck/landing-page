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

// The analytics component embeds one ID in JavaScript. Ignore stray whitespace
// and repeated lines in the deployment setting rather than producing invalid JS.
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ?.split(/\s+/)
  .find((value) => /^G-[A-Z0-9]+$/.test(value));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Huddle Duck | Ad agency for local businesses",
  description:
    "We plan, make and run Instagram and Facebook ads for restaurants and local businesses. 125+ locations over 7 years. Tell us about your business.",
  metadataBase: new URL("https://huddleduck.co.uk"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Local ads that bring people through your door.",
    description:
      "Huddle Duck is an ad agency for local businesses. We take on a few new clients at a time. Tell us about yours.",
    url: "https://huddleduck.co.uk",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Huddle Duck, ad agency for local businesses",
      },
    ],
    siteName: "Huddle Duck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local ads that bring people through your door.",
    description:
      "An ad agency for local businesses. We take on a few new clients at a time.",
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
        {gaMeasurementId && (
          <GoogleAnalytics gaId={gaMeasurementId} />
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
                  logo: "https://huddleduck.co.uk/duck-logo.png",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
