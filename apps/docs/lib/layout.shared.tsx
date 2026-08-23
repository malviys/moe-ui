import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
    nav: {
      title: "Moe UI",
      url: "/",
    },
    links: [
      { text: "Docs", url: "/docs" },
      { text: "Components", url: "/docs/component-list" },
      { text: "Install", url: "/docs/installation" },
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
