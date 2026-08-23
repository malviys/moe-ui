import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://moe-ui.vercel.app/sitemap.xml",
    host: "https://moe-ui.vercel.app",
  };
}
