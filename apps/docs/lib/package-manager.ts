export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;

export type PackageManager = (typeof packageManagers)[number];

export function getAddCommand(name: string, manager: PackageManager) {
  const command = `@moe-ui/cli@beta add ${name}`;

  switch (manager) {
    case "npm":
      return `npx ${command}`;
    case "yarn":
      return `yarn dlx ${command}`;
    case "bun":
      return `bunx ${command}`;
    default:
      return `pnpm dlx ${command}`;
  }
}
