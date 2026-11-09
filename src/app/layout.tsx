import type { ReactNode } from "react";

// Two sites share this app: Huddle Duck (huddleduck.co.uk) in the (huddle)
// group and MR. ASAD (asadshah.co.uk) in the (asad) group. Each group layout
// owns its own metadata, fonts and scripts. src/proxy.ts routes by host.
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
