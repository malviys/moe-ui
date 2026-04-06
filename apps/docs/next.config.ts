import { createMDX } from "fumadocs-mdx/next";
import { withExpo } from "@expo/next-adapter";
import { withUniwind } from "uniwind-plugin-next";
import { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  // output: "export",
  reactStrictMode: true,
  // TODO: Remove this once the types are fixed
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@moe/registry",
    "react-native",
    "react-native-web",
    "lucide-react-native",
    "uniwind",
  ],
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

export default withMDX(withExpo(config));
