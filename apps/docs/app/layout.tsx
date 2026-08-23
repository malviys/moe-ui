import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://moe-ui.vercel.app"),
  title: {
    default: "Moe UI — Web components you own",
    template: "%s · Moe UI",
  },
  description:
    "Accessible, source-owned React components for Next.js, built web first with React Native Web.",
  applicationName: "Moe UI",
  authors: [
    { name: "Moe UI contributors", url: "https://github.com/moe-ui/moe-ui" },
  ],
  keywords: [
    "React",
    "Next.js",
    "React Native Web",
    "components",
    "accessibility",
    "source registry",
  ],
  openGraph: {
    type: "website",
    siteName: "Moe UI",
    title: "Moe UI — Web components you own",
    description:
      "30 accessible React components. Installed as source. Tested in real browsers.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moe UI — Web components you own",
    description:
      "30 accessible React components. Installed as source. Tested in real browsers.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#11100e" },
  ],
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
