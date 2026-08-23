import path from "node:path";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import { withUniwind } from "uniwind-plugin-next";

const withMDX = createMDX();

const config: NextConfig = {
  // output: "export",
  reactStrictMode: true,
  transpilePackages: [
    "@moe-ui/registry",
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
    "@rn-primitives/popover",
    "@rn-primitives/portal",
    "@rn-primitives/progress",
    "@rn-primitives/radio-group",
    "@rn-primitives/select",
    "@rn-primitives/separator",
    "@rn-primitives/slot",
    "@rn-primitives/switch",
    "@rn-primitives/tabs",
    "@rn-primitives/toggle",
    "@rn-primitives/toggle-group",
    "@rn-primitives/tooltip",
    "react-native",
    "react-native-reanimated",
    "react-native-screens",
    "react-native-svg",
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
  webpack(webpackConfig, { webpack }) {
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({ __DEV__: JSON.stringify(false) }),
    );
    webpackConfig.resolve ??= {};
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias ?? {}),
      "lucide-react-native$": "lucide-react",
      "react-native$": "react-native-web",
      "react-native-screens$": path.resolve(
        import.meta.dirname,
        "lib/react-native-screens.web.tsx",
      ),
      "react-native-reanimated$": path.resolve(
        import.meta.dirname,
        "lib/react-native-reanimated.web.tsx",
      ),
      "uniwind/components/index$": path.resolve(
        import.meta.dirname,
        "lib/uniwind-react-native.web.ts",
      ),
      "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
      "react-native/Libraries/vendor/emitter/EventEmitter$":
        "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
      "react-native/Libraries/EventEmitter/NativeEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter",
    };
    webpackConfig.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ...(webpackConfig.resolve.extensions ?? []),
    ];

    return webpackConfig;
  },
};

export default withUniwind(withMDX(config), {
  cssEntryFile: "./app/global.css",
  dtsFile: "./uniwind-types.d.ts",
});
