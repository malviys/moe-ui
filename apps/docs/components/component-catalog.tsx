import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  type ComponentCategory,
  categoryDetails,
  componentCategories,
} from "@/lib/component-accents";
import { components } from "@/lib/registry";

export function ComponentCatalog() {
  return (
    <div className="component-catalog not-prose">
      {componentCategories.map((category) => {
        const entries = components.filter(
          (component) => component.category === category,
        );
        const details = categoryDetails[category];

        return (
          <section
            key={category}
            className="catalog-group"
            data-accent={category}
            aria-labelledby={`catalog-${category}`}
          >
            <header>
              <span className="category-orbit" aria-hidden />
              <div>
                <h2 id={`catalog-${category}`}>{details.label}</h2>
                <p>{details.description}</p>
              </div>
              <span className="catalog-count">{entries.length}</span>
            </header>
            <div className="catalog-grid">
              {entries.map((component) => (
                <CatalogCard
                  key={component.name}
                  component={component}
                  category={category}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CatalogCard({
  component,
  category,
}: {
  component: (typeof components)[number];
  category: ComponentCategory;
}) {
  return (
    <Link
      href={`/docs/components/${component.name}`}
      className="catalog-card"
      data-accent={category}
    >
      <div className="catalog-glyph" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div>
        <h3>{component.title}</h3>
        <p>{component.description}</p>
      </div>
      <ArrowUpRight className="catalog-arrow" aria-hidden />
    </Link>
  );
}
