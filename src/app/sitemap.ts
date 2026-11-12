import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // asadshah.co.uk (MR. ASAD) and huddleduck.co.uk share this app; list each site's own pages.
  if (((await headers()).get("host") ?? "").toLowerCase().startsWith("asadshah.co.uk")) {
    return [
      {url: "https://asadshah.co.uk/", lastModified: new Date("2026-11-09"), changeFrequency: "monthly", priority: 1},
      {url: "https://asadshah.co.uk/privacy", lastModified: new Date("2026-11-09"), changeFrequency: "yearly", priority: 0.3},
    ];
  }
  return [
    {
      url: "https://huddleduck.co.uk",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://huddleduck.co.uk/start",
      lastModified: new Date("2026-10-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://huddleduck.co.uk/wins",
      lastModified: new Date("2026-11-12"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://huddleduck.co.uk/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
