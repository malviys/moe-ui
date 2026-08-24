import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./styles/global.css";
import type { Metadata, Viewport } from "next";
import { SearchFocusRestoration } from "@/components/search-focus-restoration";

export const metadata: Metadata = {
  metadataBase: new URL("https://moe-ui-docs.vercel.app"),
  title: {
    default: "Moe UI — React Native and web components",
    template: "%s · Moe UI",
  },
  description: "A collection of components for Expo and Next.js.",
  applicationName: "Moe UI",
  authors: [
    { name: "Moe UI contributors", url: "https://github.com/malviys/moe-ui" },
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
    title: "Moe UI — React Native and web components",
    description: "A collection of components for Expo and Next.js.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moe UI — React Native and web components",
    description: "A collection of components for Expo and Next.js.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
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
