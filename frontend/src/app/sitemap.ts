import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${base}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
