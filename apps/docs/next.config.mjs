import { createMDX } from 'fumadocs-mdx/next';
import { withExpo } from '@expo/next-adapter';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  test: /\.(js|jsx|ts|tsx)$/,
  transpilePackages: [
    "@moe/registry",
    "react-native",
    "react-native-web"
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
