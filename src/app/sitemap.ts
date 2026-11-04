import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {url: "https://huddleduck.co.uk/talk-to-asad", lastModified: new Date("2026-11-04"), changeFrequency: "monthly", priority: 0.8},
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
      url: "https://huddleduck.co.uk/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
