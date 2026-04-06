import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Moe UI",
      url: "/",
    },
    links: [{ text: "Docs", url: "/docs" }],
    githubUrl: "https://github.com/moe-ui/moe-ui",
  };
}

export const banner = {
  content: (
    <>
      🚧 This project is in <strong>experimental phase</strong> and will be
      stable after v1.0.0
    </>
  ),
};
