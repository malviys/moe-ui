import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

function SiteTitle() {
  return (
    <span className="site-wordmark">
      <span className="site-mark" aria-hidden>
        m
      </span>
      <span>Moe UI</span>
      <span className="site-beta">beta</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
    nav: {
      title: <SiteTitle />,
      url: "/",
      transparentMode: "none",
    },
    links: [
      { text: "Docs", url: "/docs", active: "nested-url" },
      { text: "Components", url: "/docs/components" },
      { text: "Installation", url: "/docs/installation" },
    ],
    githubUrl: "https://github.com/moe-ui/moe-ui",
  };
}

export const banner = {
  content: (
    <>
      <strong>v0.1 beta:</strong> source-owned components for Next.js and Expo.
    </>
  ),
};
