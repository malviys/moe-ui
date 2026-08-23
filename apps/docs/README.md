# Moe UI documentation

The Fumadocs application hosts the Moe UI web beta documentation, generated registry, schemas, and Playwright browser matrix.

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev:docs
```

Open [http://localhost:3000](http://localhost:3000). Production builds use Next.js Webpack because the Uniwind Next plugin does not support Turbopack.

Registry assets in `public/r` and `public/schema` are generated from the private canonical source:

```bash
pnpm registry:generate
pnpm registry:check
```

Do not hand-edit generated registry assets or component MDX files.
