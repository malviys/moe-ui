import { describe, expect, it } from "vitest";
import { getAddCommand, packageManagers } from "../lib/package-manager";

describe("documentation package-manager commands", () => {
  it("generates the supported add command for each runner", () => {
    expect(
      packageManagers.map((manager) => getAddCommand("dialog", manager)),
    ).toEqual([
      "pnpm dlx @moe-ui/cli@beta add dialog",
      "npx @moe-ui/cli@beta add dialog",
      "yarn dlx @moe-ui/cli@beta add dialog",
      "bunx @moe-ui/cli@beta add dialog",
    ]);
  });
});
