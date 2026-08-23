import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moe UI",
    short_name: "Moe UI",
    description: "Web-first React components installed as source.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#b45309",
  };
}
