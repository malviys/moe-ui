# @moe-ui/cli

Install editable Moe UI component source into a TypeScript Next.js or Expo project.

```bash
pnpm dlx @moe-ui/cli@beta
pnpm dlx @moe-ui/cli@beta init
pnpm dlx @moe-ui/cli@beta add button dialog
```

Running without arguments opens an interactive menu. `init` prompts for Uniwind or NativeWind and the registry URL. Running `add` without component names loads the registry index and prompts for one or more components.

In automation, pass `--styling uniwind|nativewind` or use `--yes` to select Uniwind and the production registry. A custom or local registry can be stored during initialization:

```bash
pnpm dlx @moe-ui/cli@beta init --registry http://localhost:3000/r
```

Generate and serve the local registry from the repository with `pnpm registry:generate` and `pnpm dev:docs`.

NativeWind initialization targets the v5 preview and its Tailwind CSS 4 stack.

The beta registry is hosted at `https://moe-ui.vercel.app/r`.
