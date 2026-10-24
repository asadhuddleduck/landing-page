import fallback from "./client-logo-fallback.json";

export type ClientLogo = (typeof fallback)[number];
const ORIGIN = "https://www.superpulse.io";

// Both sites share SuperPulse's public catalog. Local marks survive feed outages.
export async function getClientLogos(): Promise<ClientLogo[]> {
  try {
    const response = await fetch(`${ORIGIN}/api/public/client-logo-catalog`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return fallback;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("logos" in payload) || !Array.isArray(payload.logos)) {
      return fallback;
    }
    const logos: ClientLogo[] = [];
    const ids = new Set<string>();
    for (const item of payload.logos.slice(0, 150)) {
      if (!item || typeof item !== "object") continue;
      const logo = item as Record<string, unknown>;
      if (
        typeof logo.id !== "string" || ids.has(logo.id) ||
        typeof logo.name !== "string" || !logo.name.trim() || logo.name.length > 100 ||
        typeof logo.src !== "string" ||
        !/^\/(?:logos\/wall\/[a-z0-9-]+\.(?:webp|svg)|api\/public\/client-logo\/[a-z0-9-]+)$/.test(logo.src) ||
        !Number.isInteger(logo.width) || Number(logo.width) < 8 || Number(logo.width) > 4_000 ||
        logo.height !== 192 || !Number.isInteger(logo.opticalHeight) ||
        Number(logo.opticalHeight) < 14 || Number(logo.opticalHeight) > 40 ||
        (logo.lane !== 1 && logo.lane !== 2) || !Number.isInteger(logo.order)
      ) continue;
      ids.add(logo.id);
      logos.push({ ...(logo as ClientLogo), src: `${ORIGIN}${logo.src}` });
    }
    return logos.length ? logos.sort((a, b) => a.order - b.order) : fallback;
  } catch {
    return fallback;
  }
}
