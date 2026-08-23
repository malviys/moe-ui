"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ButtonPreview = dynamic(() =>
  import("./preview/button").then((module) => module.ButtonPreview),
);
const DialogPreview = dynamic(() => import("./preview/dialog-preview"));
const InputPreview = dynamic(() => import("./preview/input-preview"));
const SelectPreview = dynamic(() => import("./preview/select-preview"));
const TabsPreview = dynamic(() => import("./preview/tabs-preview"));
const TooltipPreview = dynamic(() => import("./preview/tooltip-preview"));

const showcase = [
  {
    name: "button",
    title: "Button",
    category: "foundation",
    Preview: ButtonPreview,
    className: "showcase-button",
  },
  {
    name: "input",
    title: "Input",
    category: "form",
    Preview: InputPreview,
    className: "showcase-input",
  },
  {
    name: "select",
    title: "Select",
    category: "form",
    Preview: SelectPreview,
    className: "showcase-select",
  },
  {
    name: "dialog",
    title: "Dialog",
    category: "overlay",
    Preview: DialogPreview,
    className: "showcase-dialog",
  },
  {
    name: "tooltip",
    title: "Tooltip",
    category: "feedback",
    Preview: TooltipPreview,
    className: "showcase-tooltip",
  },
] as const;

export function HomeShowcase() {
  return (
    <div className="home-showcase">
      <article className="showcase-card showcase-tabs" data-accent="navigation">
        <ShowcaseHeader name="tabs" title="Tabs" />
        <div className="showcase-preview showcase-preview-tabs">
          <TabsPreview />
        </div>
      </article>
      {showcase.map(({ name, title, category, Preview, className }) => (
        <article
          key={name}
          className={`showcase-card ${className}`}
          data-accent={category}
        >
          <ShowcaseHeader name={name} title={title} />
          <div className="showcase-preview">
            <Preview />
          </div>
        </article>
      ))}
    </div>
  );
}

function ShowcaseHeader({ name, title }: { name: string; title: string }) {
  return (
    <header>
      <span className="category-orbit" aria-hidden />
      <span>{title}</span>
      <Link href={`/docs/components/${name}`}>Open</Link>
    </header>
  );
}
