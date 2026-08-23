import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./styles/global.css";
import type { Metadata, Viewport } from "next";
import { SearchFocusRestoration } from "@/components/search-focus-restoration";

export const metadata: Metadata = {
  metadataBase: new URL("https://moe-ui.vercel.app"),
  title: {
    default: "Moe UI — Components you own",
    template: "%s · Moe UI",
  },
  description:
    "Accessible, source-owned React components for Next.js and Expo, delivered as code you can shape.",
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
      "31 accessible React components. Installed as source. Built for Next.js and Expo.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moe UI — Web components you own",
    description:
      "31 accessible React components. Installed as source. Built for Next.js and Expo.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf2" },
    { media: "(prefers-color-scheme: dark)", color: "#151310" },
  ],
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col`}
      >
        <RootProvider
          theme={{
            attribute: "class",
            defaultTheme: "system",
            enableColorScheme: true,
            enableSystem: true,
            storageKey: "moe-ui-docs-theme",
          }}
        >
          <SearchFocusRestoration />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
