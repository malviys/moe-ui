# Moe UI

Moe UI is a web-first, source-copy component registry for TypeScript Next.js 16 App Router projects. The CLI installs accessible React Native Web component source into your app—you own the files, styling, and product decisions.

> `v0.1.0-beta.1` targets React 19 and modern desktop browsers. Native iOS and Android support is next, not part of this beta contract.

## Quick start

```bash
pnpm dlx @moe-ui/cli@beta init
pnpm dlx @moe-ui/cli@beta add button dialog
```

The initializer detects pnpm, npm, or yarn and `src/` layouts, then configures React Native Web, Uniwind, theme CSS, and source aliases. The `add` command validates checksums, resolves source dependencies recursively, and protects local changes.

## Supported stack

- Node.js 20.9+
- Next.js 16.1 App Router with Webpack
- React 19.2
- React Native 0.83 and React Native Web 0.21
- Uniwind 1.11 and Tailwind CSS 4
- Chromium, Firefox, and WebKit desktop engines

## Component catalog

The beta currently contains 31 source items: Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Button, Card, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Input, Label, Menubar, Popover, Progress, Radio Group, Select, Separator, Sheet, Skeleton, Switch, Tabs, Text, Textarea, Toggle, Toggle Group, and Tooltip.

Every component page at [moe-ui.vercel.app](https://moe-ui.vercel.app) includes a live preview, install command, public exports, canonical source, accessibility behavior, and browser status.

## Repository

| Workspace | Purpose |
| --- | --- |
| `apps/docs` | Fumadocs website, public registry assets, and browser tests |
| `packages/registry` | Private canonical component source and metadata |
| `packages/cli` | Public `@moe-ui/cli` package |

Components are not published as a runtime package. `@moe-ui/registry` remains private and the CLI copies generated registry source into user projects.

## Local development

This repository is standardized on pnpm 9.15.4.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:docs
```

Required release checks:

```bash
pnpm registry:check
pnpm lint
pnpm types:check
pnpm test
pnpm test:e2e
pnpm build
```

Registry JSON and component documentation are generated from `packages/registry/registry.json` and canonical source:

```bash
pnpm registry:generate
```

## Release status

`v0.1.0-beta.1` is a prerelease candidate. The release remains blocked until every manifest entry passes the three-browser interaction, responsive visual, light/dark, and automated accessibility matrix. Publishing happens only after the production registry endpoints pass smoke tests.

## Roadmap

- Stabilize the Next.js web beta and source ownership workflow.
- Validate and document React Native iOS and Android behavior.
- Add new components only after the existing catalog clears release gates.

The experimental filters package is not part of this release.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a change. Component behavior changes require focused tests, generated registry output, documentation updates, and a changelog entry when they affect the beta API.

## License

[MIT](./LICENSE)
