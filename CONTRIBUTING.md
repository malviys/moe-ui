# Contributing to Moe UI

Thank you for helping make the web beta reliable. Use Node.js 20.9+ and pnpm 9.15.4.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:docs
```

Canonical component source lives in `packages/registry/src`. Update `packages/registry/registry.json` when adding metadata, then run `pnpm registry:generate`. Generated files in `apps/docs/public` and component MDX files must be committed.

Run `pnpm format` to format the repository. `pnpm check` verifies Prettier formatting, ESLint rules, and TypeScript types; the same command runs automatically before each Git push after dependencies are installed.

## Pull requests

- Keep existing component exports and prop shapes unless correctness or accessibility requires a beta correction.
- Add focused tests for state, disabled behavior, helpers, and regressions.
- Add or update Playwright behavior for interactive components.
- Run `pnpm registry:check`, `pnpm check`, `pnpm test`, `pnpm test:e2e`, and `pnpm build`.
- Document user-visible API corrections in the changelog.

Do not add native production claims until iOS and Android have their own release matrix. Do not include Command, Combobox, Toast, Form, blocks, or filters in the `v0.1.0-beta.1` scope.
