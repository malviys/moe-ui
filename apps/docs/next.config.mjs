import { createMDX } from 'fumadocs-mdx/next';
import { withExpo } from '@expo/next-adapter';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
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
  ],
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

export default withMDX(withExpo(config));
