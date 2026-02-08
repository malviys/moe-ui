import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main
      id="nd-page"
      className="max-w-fd-container mx-auto flex w-full flex-1 flex-col items-center gap-4 pt-4 md:pt-0"
    >
      {/* Hero Section */}
      <div className="container relative z-0 flex flex-col items-center gap-2 py-8 text-center md:pt-16 lg:pt-20 xl:gap-4">
        {/* Grid background */}
        <div className="bg-grid-print pointer-events-none fixed inset-0 h-full w-full z-[-1] bg-white opacity-60 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,red,#0000)] dark:bg-neutral-800" />

        {/* Announcement Badge */}
        <div className="h-6">
          <Link
            href="/docs/components"
            className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border px-2 py-0.5 text-xs rounded-full font-normal bg-card dark:bg-secondary border-border/75 hover:bg-accent transition-colors"
          >
            Browse 50+ Components <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Headline */}
        <h1 className="text-primary/90 leading-tighter max-w-3xl text-balance text-4xl font-semibold tracking-tight lg:leading-[1.1] xl:max-w-7xl xl:text-5xl xl:font-medium xl:tracking-tighter">
          Build your Universal Component Library
        </h1>

        {/* Description */}
        <p className="text-foreground/80 max-w-3xl text-balance text-base sm:text-lg">
          Bringing{" "}
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground"
          >
            shadcn/ui
          </a>{" "}
          to React Native. Beautifully crafted components with NativeWind, open
          source, and <em>almost as easy to use.</em>
        </p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 py-2">
          <span className="source-badge shadcn">shadcn/ui</span>
          <span className="source-badge reui">ReUI</span>
          <span className="source-badge rnr">RNR</span>
          <span className="source-badge nativewind">NativeWind</span>
        </div>

        {/* CTA */}
        <div className="flex w-full items-center justify-center gap-3 pt-2">
          <Link
            href="/docs"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium rounded-md px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/docs/components"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium rounded-md px-4 py-2 border border-border bg-background hover:bg-accent transition-colors"
          >
            Browse Components
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">🎯 Best of All Worlds</h3>
          <p className="text-sm text-muted-foreground">
            Handpicked components from the most popular UI libraries, so you
            don't have to choose.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">📱 Universal</h3>
          <p className="text-sm text-muted-foreground">
            One codebase for iOS, Android, and Web — consistent styling
            everywhere.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">♿ Accessible</h3>
          <p className="text-sm text-muted-foreground">
            Built on rn-primitives with proper ARIA support and keyboard
            navigation.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <h3 className="font-semibold mb-2">🎨 Customizable</h3>
          <p className="text-sm text-muted-foreground">
            Styled with NativeWind (TailwindCSS) — easy theming and dark mode
            support.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border">
        <div className="container flex h-20 items-center justify-center">
          <p className="text-muted-foreground text-center text-xs leading-loose lg:text-sm">
            Built with{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              shadcn/ui
            </a>{" "}
            and{" "}
            <a
              href="https://fumadocs.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Fumadocs
            </a>
            . Source on{" "}
            <a
              href="https://github.com/moe-ui/moe-ui"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
