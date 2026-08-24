"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const AccordionPreview = dynamic(
  () => import("./preview/accordion").then((module) => module.AccordionPreview),
  { ssr: false },
);
const ButtonPreview = dynamic(
  () => import("./preview/button").then((module) => module.ButtonPreview),
  { ssr: false },
);
const CardPreview = dynamic(() => import("./preview/card-preview"), {
  ssr: false,
});
const CheckboxPreview = dynamic(() => import("./preview/checkbox-preview"), {
  ssr: false,
});
const DialogPreview = dynamic(() => import("./preview/dialog-preview"), {
  ssr: false,
});
const InputPreview = dynamic(() => import("./preview/input-preview"), {
  ssr: false,
});
const SelectPreview = dynamic(() => import("./preview/select-preview"), {
  ssr: false,
});
const SwitchPreview = dynamic(() => import("./preview/switch-preview"), {
  ssr: false,
});
const TabsPreview = dynamic(() => import("./preview/tabs-preview"), {
  ssr: false,
});
const TooltipPreview = dynamic(() => import("./preview/tooltip-preview"), {
  ssr: false,
});

const showcase = [
  {
    name: "button",
    title: "Button",
    Preview: ButtonPreview,
    className: "showcase-button",
  },
  {
    name: "input",
    title: "Input",
    Preview: InputPreview,
    className: "showcase-input",
  },
  {
    name: "card",
    title: "Card",
    Preview: CardPreview,
    className: "showcase-card-preview",
  },
  {
    name: "select",
    title: "Select",
    Preview: SelectPreview,
    className: "showcase-select",
  },
  {
    name: "dialog",
    title: "Dialog",
    Preview: DialogPreview,
    className: "showcase-dialog",
  },
  {
    name: "accordion",
    title: "Accordion",
    Preview: AccordionPreview,
    className: "showcase-accordion",
  },
  {
    name: "checkbox",
    title: "Checkbox",
    Preview: CheckboxPreview,
    className: "showcase-checkbox",
  },
  {
    name: "switch",
    title: "Switch",
    Preview: SwitchPreview,
    className: "showcase-switch",
  },
  {
    name: "tooltip",
    title: "Tooltip",
    Preview: TooltipPreview,
    className: "showcase-tooltip",
  },
] as const;

export function HomeShowcase() {
  return (
    <div className="home-showcase">
      <article className="showcase-card showcase-tabs">
        <ShowcaseHeader name="tabs" title="Tabs" />
        <div className="showcase-preview showcase-preview-tabs">
          <TabsPreview />
        </div>
      </article>
      {showcase.map(({ name, title, Preview, className }) => (
        <article key={name} className={`showcase-card ${className}`}>
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
      <span>{title}</span>
      <Link href={`/docs/components/${name}`}>View</Link>
    </header>
  );
}
