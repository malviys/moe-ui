import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getComponentCategory } from "@/lib/component-accents";
import { ComponentPreviewClient } from "./component-preview.client";
import { InstallCommand } from "./install-command";
import type { PreviewName } from "./preview-registry";

type ComponentPreviewProps = {
  children?: React.ReactNode;
  name?: `${PreviewName}-preview` | PreviewName;
  variant?: string;
};

const nestedPreviewDirectories = new Set([
  "accordion",
  "alert",
  "avatar",
  "button",
  "text",
]);

function getPreviewFile(name: PreviewName, variant?: string) {
  if (nestedPreviewDirectories.has(name)) {
    return path.join(name, variant ? `${variant}.tsx` : "index.tsx");
  }

  return `${name}-preview.tsx`;
}

export async function ComponentPreview({
  children,
  name,
  variant,
}: ComponentPreviewProps) {
  const normalizedName = name?.replace(/-preview$/, "") as
    PreviewName | undefined;
  const source = normalizedName
    ? await readFile(
        path.join(
          process.cwd(),
          "components/preview",
          getPreviewFile(normalizedName, variant),
        ),
        "utf8",
      )
    : "";
  const category = getComponentCategory(normalizedName);

  return (
    <>
      <ComponentPreviewClient
        name={name}
        variant={variant}
        source={source}
        category={category}
      >
        {children}
      </ComponentPreviewClient>
      {normalizedName && !variant ? (
        <InstallCommand name={normalizedName} />
      ) : null}
    </>
  );
}
