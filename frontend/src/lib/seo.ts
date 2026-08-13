/** Canonical site URL for metadata, sitemap, and JSON-LD. */
import { PILLARS_INLINE, SITE_POSITIONING, SITE_SPECIALISE } from "@/lib/brand-copy";

/**
 * Never fall back to VERCEL_URL — that leaks personal/preview hosts into canonical + og:url.
 * Production must set NEXT_PUBLIC_SITE_URL (e.g. https://olynixx.com).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) {
    return fromEnv.startsWith("http")
      ? fromEnv.replace(/\/$/, "")
      : `https://${fromEnv.replace(/\/$/, "")}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://olynixx.com";
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "Olynixx Praxis";
export const SITE_TAGLINE = SITE_POSITIONING;
export const DEFAULT_DESCRIPTION = `${SITE_SPECIALISE} Olynixx Praxis teaches, certifies, and deploys non-medical human performance coaches across ${PILLARS_INLINE} in the UAE.`;

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/focus", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/certification", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/organisations", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/work-with-us", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/standards", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
];
