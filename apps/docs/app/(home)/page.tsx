import {
  ArrowRight,
  Boxes,
  Check,
  Code2,
  Github,
  Layers3,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { HomeShowcase } from "@/components/home-showcase";

const features = [
  {
    icon: Code2,
    eyebrow: "Open source, literally",
    title: "Own every line",
    body: "The CLI places readable TypeScript in your app. Adapt the API, the styling, or the behavior without waiting on a package release.",
    accent: "foundation",
  },
  {
    icon: Layers3,
    eyebrow: "One component tree",
    title: "Next.js and Expo",
    body: "Shared React Native primitives keep web and native experiences aligned while each platform gets the integration it needs.",
    accent: "navigation",
  },
  {
    icon: Palette,
    eyebrow: "Your styling choice",
    title: "Uniwind or NativeWind",
    body: "Start with the Tailwind-powered engine that fits your project. Moe keeps component source neutral and editable.",
    accent: "overlay",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Release-gated quality",
    title: "Accessibility in the loop",
    body: "Keyboard behavior, focus, contrast, and browser interaction checks run against the same previews you see in these docs.",
    accent: "feedback",
  },
] as const;

export default function HomePage() {
  return (
    <main className="home-shell flex-1">
      <section className="home-hero">
        <div className="home-grid" aria-hidden />
        <div className="hero-colour hero-colour-coral" aria-hidden />
        <div className="hero-colour hero-colour-violet" aria-hidden />
        <div className="hero-colour hero-colour-mint" aria-hidden />
        <div className="home-container home-hero-content">
          <div className="hero-copy">
            <div className="hero-kicker">
              <Sparkles aria-hidden />
              31 accessible components · source included
            </div>
            <h1>
              Components you can
              <span>make unmistakably yours.</span>
            </h1>
            <p>
              Moe UI brings accessible React components to Next.js and Expo as
              editable source. Start polished, then shape every detail around
              your product.
            </p>
            <div className="hero-actions">
              <Link href="/docs/installation" className="hero-primary-action">
                Start building <ArrowRight aria-hidden />
              </Link>
              <Link href="/docs/components" className="hero-secondary-action">
                Browse components
              </Link>
              <Link
                href="https://github.com/moe-ui/moe-ui"
                target="_blank"
                className="hero-github-action"
                aria-label="Moe UI on GitHub"
              >
                <Github aria-hidden /> GitHub
              </Link>
            </div>
            <CopyCommand command="pnpm dlx @moe-ui/cli@beta init" />
          </div>
          <section
            className="hero-proof"
            aria-label="Moe UI source transaction"
          >
            <div className="hero-proof-toolbar">
              <span>source transaction</span>
              <span>
                <span aria-hidden /> ready
              </span>
            </div>
            <div className="hero-proof-body">
              <p>
                <span>01</span> registry item resolved
              </p>
              <p>
                <span>02</span> dependencies verified
              </p>
              <p className="hero-proof-added">
                <span>03</span> + components/ui/dialog.tsx
              </p>
              <div>
                <Check aria-hidden />
                <span>
                  <strong>The source is yours.</strong>
                  No runtime component package and no locked abstraction.
                </span>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="home-showcase-section">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A component playground</p>
              <h2>Useful defaults. Plenty of personality.</h2>
            </div>
            <p>
              Interact with the same source-owned components that ship through
              the registry—no static mockups and no hidden implementation.
            </p>
          </div>
          <HomeShowcase />
        </div>
      </section>

      <section className="home-feature-section">
        <div className="home-container">
          <div className="section-heading section-heading-compact">
            <div>
              <p className="eyebrow">Designed to leave the nest</p>
              <h2>A foundation, not a ceiling.</h2>
            </div>
            <Boxes aria-hidden />
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, eyebrow, title, body, accent }) => (
              <article
                key={title}
                className="feature-card"
                data-accent={accent}
              >
                <div className="feature-icon">
                  <Icon aria-hidden />
                </div>
                <p className="eyebrow">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-container home-cta-card">
          <div>
            <p className="eyebrow">The source is the product</p>
            <h2>Start with a component. End with your design system.</h2>
          </div>
          <Link href="/docs/installation">
            Initialize Moe UI <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
