import { ArrowRight, Check, Code2, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";

const stats = [
  ["31", "components"],
  ["3", "browser engines"],
  ["AA", "interaction target"],
  ["100%", "source owned"],
] as const;

export default function HomePage() {
  return (
    <main className="home-shell flex-1">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div className="home-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-[88rem] gap-14 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[1.18fr_0.82fr] lg:items-end lg:py-36">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/8 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_0_4px_color-mix(in_oklab,#f59e0b_18%,transparent)]" />
              v0.1 web beta
            </div>
            <h1 className="home-display max-w-5xl text-balance text-6xl leading-[0.92] tracking-[-0.055em] text-fd-foreground sm:text-7xl lg:text-[6.7rem]">
              Build the interface.
              <em className="block font-normal text-amber-700 dark:text-amber-400">
                Keep the source.
              </em>
            </h1>
            <p className="mt-8 max-w-2xl text-balance text-lg leading-8 text-fd-muted-foreground md:text-xl">
              Moe UI is a source-owned component system for React. Accessible,
              cross-platform components for Next.js, Expo, and beyond—copied
              into your project as code you can own, adapt, and evolve.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/docs/installation"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-fd-foreground px-5 text-sm font-semibold text-fd-background transition-transform hover:-translate-y-0.5"
              >
                Start building <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/docs/components"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-fd-border bg-fd-background/70 px-5 text-sm font-semibold backdrop-blur transition-colors hover:bg-fd-accent"
              >
                Browse components
              </Link>
              <Link
                href="https://github.com/moe-ui/moe-ui"
                target="_blank"
                className="inline-flex size-11 items-center justify-center rounded-full border border-fd-border bg-fd-background/70 hover:bg-fd-accent"
                aria-label="Moe UI on GitHub"
              >
                <Github className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="relative lg:pb-3">
            <div
              className="absolute -inset-8 -z-10 bg-[radial-gradient(circle,_color-mix(in_oklab,#f59e0b_14%,transparent),_transparent_68%)]"
              aria-hidden
            />
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                <span>source transaction</span>
                <span className="text-emerald-400">ready</span>
              </div>
              <div className="space-y-6 p-5 font-mono text-sm sm:p-7">
                <div>
                  <span className="mr-3 text-amber-400">$</span>
                  <span>pnpm dlx @moe-ui/cli@beta init</span>
                </div>
                <div>
                  <span className="mr-3 text-amber-400">$</span>
                  <span>pnpm dlx @moe-ui/cli@beta add dialog</span>
                </div>
                <div className="space-y-2 border-l border-neutral-800 pl-4 text-xs text-neutral-400">
                  <p className="text-emerald-400">✓ registry verified</p>
                  <p>+ components/ui/dialog.tsx</p>
                  <p>+ components/ui/button.tsx</p>
                  <p>+ lib/utils.ts</p>
                </div>
                <div className="flex items-center gap-2 border-t border-neutral-800 pt-5 text-xs text-neutral-400">
                  <Check className="size-3.5 text-emerald-400" aria-hidden /> No
                  runtime component package. No lock-in.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-fd-border bg-fd-card/45">
        <div className="mx-auto grid max-w-[88rem] grid-cols-2 divide-x divide-y divide-fd-border border-x border-fd-border md:grid-cols-4 md:divide-y-0">
          {stats.map(([value, label]) => (
            <div key={label} className="px-6 py-7 md:px-8">
              <p className="home-display text-4xl tracking-tight text-fd-foreground">
                {value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fd-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
              The beta contract
            </p>
            <h2 className="home-display mt-4 text-5xl leading-none tracking-[-0.04em]">
              Small surface.
              <br />
              Serious standard.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-fd-border bg-fd-border md:grid-cols-3">
            {[
              {
                icon: Code2,
                title: "Source, not wrappers",
                body: "The CLI resolves dependencies and writes readable TypeScript into your app.",
              },
              {
                icon: ShieldCheck,
                title: "Interaction audited",
                body: "Keyboard, focus, contrast, and axe checks gate every component route.",
              },
              {
                icon: Check,
                title: "Browser proven",
                body: "Chromium, Firefox, and WebKit run the same preview and behavior suite.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <article key={title} className="bg-fd-card p-7 md:min-h-64">
                <Icon
                  className="size-5 text-amber-700 dark:text-amber-400"
                  aria-hidden
                />
                <h3 className="mt-12 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
