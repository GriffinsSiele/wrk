/** Canonical site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;
  if (fromEnv) {
    return fromEnv.startsWith("http") ? fromEnv.replace(/\/$/, "") : `https://${fromEnv.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "Olynixx Praxis";
export const SITE_TAGLINE = "Where trusted specialists are made.";
export const DEFAULT_DESCRIPTION =
  "We don't replace your certification. We specialise it. Learn, certify, and deploy performance specialists across the UAE.";

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
