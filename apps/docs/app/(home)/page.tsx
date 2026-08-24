import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { HomeShowcase } from "@/components/home-showcase";

export default function HomePage() {
  return (
    <main className="home-shell flex-1">
      <section className="home-hero">
        <div className="home-container home-hero-content">
          <div className="hero-copy">
            <h1>Components for React Native and the web.</h1>
            <p>
              A collection of components for Expo and Next.js. Add them to your
              project, then edit the source to fit your app.
            </p>
            <div className="hero-actions">
              <Link href="/docs/installation" className="hero-primary-action">
                Get started <ArrowRight aria-hidden />
              </Link>
              <Link href="/docs/components" className="hero-secondary-action">
                View components
              </Link>
              <Link
                href="https://github.com/malviys/moe-ui"
                target="_blank"
                className="hero-github-action"
                aria-label="Moe UI on GitHub"
              >
                <Github aria-hidden /> GitHub
              </Link>
            </div>
            <CopyCommand command="pnpm dlx @moe-ui/cli@beta init" />
          </div>
        </div>
      </section>

      <section className="home-showcase-section">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <h2>Components</h2>
              <p>Preview a few of the components included in Moe UI.</p>
            </div>
            <Link href="/docs/components">
              Browse all components <ArrowRight aria-hidden />
            </Link>
          </div>
          <HomeShowcase />
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container home-footer-content">
          <p>
            <strong>Moe UI</strong>
            <span>Components for Expo and Next.js.</span>
            <span>© 2026 Moe UI contributors.</span>
          </p>
          <nav aria-label="Footer navigation">
            <Link href="/docs">Docs</Link>
            <Link href="/docs/components">Components</Link>
            <Link href="https://github.com/malviys/moe-ui" target="_blank">
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
