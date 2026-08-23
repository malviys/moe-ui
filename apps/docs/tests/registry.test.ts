import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { webTestManifest } from "../lib/web-test-manifest";

type RegistryIndex = {
  schemaVersion: number;
  items: Array<{ name: string; integrity: string }>;
};

type RegistryItem = {
  schemaVersion: number;
  name: string;
  files: Array<{ target: string; content: string }>;
  dependencies: Record<string, string>;
  registryDependencies: string[];
  integrity: string;
};

const publicRoot = path.resolve(import.meta.dirname, "../public");

describe("generated registry", () => {
  it("has one valid index entry and test route for every canonical component", async () => {
    const index = JSON.parse(
      await readFile(path.join(publicRoot, "r/index.json"), "utf8"),
    ) as RegistryIndex;
    expect(index.schemaVersion).toBe(1);
    expect(index.items.map((item) => item.name)).toEqual(
      webTestManifest.map((item) => item.name).sort(),
    );
    expect(new Set(index.items.map((item) => item.name)).size).toBe(
      index.items.length,
    );
    expect(
      webTestManifest.every((item) => item.route.endsWith(item.name)),
    ).toBe(true);
  });

  it.each(
    webTestManifest.map((component) => component.name),
  )("validates %s and its source integrity", async (name) => {
    const item = JSON.parse(
      await readFile(path.join(publicRoot, `r/${name}.json`), "utf8"),
    ) as RegistryItem;
    expect(item).toMatchObject({
      schemaVersion: 1,
      name,
      dependencies: expect.any(Object),
      registryDependencies: expect.any(Array),
    });
    expect(item.files).toHaveLength(1);
    expect(item.files[0]?.target).toMatch(/^(components\/ui|lib)\//);
    const digest = createHash("sha256")
      .update(item.files[0]?.content ?? "")
      .digest("base64");
    expect(item.integrity).toBe(`sha256-${digest}`);
  });

  it("publishes versioned project and registry item schemas", async () => {
    const [componentsSchema, itemSchema] = await Promise.all([
      readFile(path.join(publicRoot, "schema/components.json"), "utf8"),
      readFile(path.join(publicRoot, "schema/registry-item.json"), "utf8"),
    ]);
    expect(JSON.parse(componentsSchema).properties.schemaVersion.const).toBe(1);
    expect(JSON.parse(itemSchema).properties.schemaVersion.const).toBe(1);
  });
});
