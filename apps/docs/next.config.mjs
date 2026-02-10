import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path'; 

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  test: /\.(js|jsx|ts|tsx)$/,
  transpilePackages: [
    "@moe/registry",
    "@rn-primitives/accordion",
    "@rn-primitives/alert-dialog",
    "@rn-primitives/aspect-ratio",
    "@rn-primitives/avatar",
    "@rn-primitives/checkbox",
    "@rn-primitives/collapsible",
    "@rn-primitives/context-menu",
    "@rn-primitives/dialog",
    "@rn-primitives/dropdown-menu",
    "@rn-primitives/hover-card",
    "@rn-primitives/label",
    "@rn-primitives/menubar",
    "@rn-primitives/navigation-menu",
    "@rn-primitives/popover",
    "@rn-primitives/portal",
    "@rn-primitives/progress",
    "@rn-primitives/radio-group",
    "@rn-primitives/scroll-area",
    "@rn-primitives/select",
    "@rn-primitives/separator",
    "@rn-primitives/slider",
    "@rn-primitives/slot",
    "@rn-primitives/switch",
    "@rn-primitives/table",
    "@rn-primitives/tabs",
    "@rn-primitives/toast",
    "@rn-primitives/toggle",
    "@rn-primitives/toggle-group",
    "@rn-primitives/toolbar",
    "@rn-primitives/tooltip",
    "@rn-primitives/types",
    "lucide-react-native",
  ],
  // turbopack: {
  //   root: path.join(process.cwd(), '..'),
  // },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

export default withMDX(config);
