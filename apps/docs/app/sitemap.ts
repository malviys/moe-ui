import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://moe-ui.vercel.app",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...source.getPages().map((page) => ({
      url: `https://moe-ui.vercel.app${page.url}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.slugs[0] === "components" ? 0.8 : 0.7,
    })),
  ];
}
