import {
  AlignLeft,
  ArrowUpRight,
  Badge,
  Boxes,
  ChartNoAxesColumnIncreasing,
  CheckSquare,
  ChevronDown,
  ChevronsUpDown,
  CircleDot,
  CircleUserRound,
  Columns3,
  CreditCard,
  GalleryVerticalEnd,
  Info,
  ListCollapse,
  ListFilter,
  type LucideIcon,
  Menu,
  MessageSquareMore,
  MessageSquareText,
  Minus,
  MousePointerClick,
  OctagonAlert,
  PanelRightOpen,
  PanelsTopLeft,
  PanelTop,
  Ratio,
  ScanLine,
  SquareCheck,
  Tag,
  TextCursorInput,
  ToggleLeft,
  ToggleRight,
  Type,
} from "lucide-react";
import Link from "next/link";
import {
  type ComponentCategory,
  categoryDetails,
  componentCategories,
} from "@/lib/component-accents";
import { components } from "@/lib/registry";

const componentIcons: Record<string, LucideIcon> = {
  accordion: ListCollapse,
  alert: Info,
  "alert-dialog": OctagonAlert,
  "aspect-ratio": Ratio,
  avatar: CircleUserRound,
  badge: Badge,
  button: MousePointerClick,
  card: CreditCard,
  checkbox: SquareCheck,
  collapsible: ChevronsUpDown,
  "context-menu": Menu,
  dialog: PanelsTopLeft,
  "dropdown-menu": ChevronDown,
  "hover-card": GalleryVerticalEnd,
  input: TextCursorInput,
  label: Tag,
  menubar: PanelTop,
  popover: MessageSquareMore,
  progress: ChartNoAxesColumnIncreasing,
  "radio-group": CircleDot,
  select: ListFilter,
  separator: Minus,
  sheet: PanelRightOpen,
  skeleton: ScanLine,
  switch: ToggleLeft,
  tabs: Columns3,
  text: Type,
  textarea: AlignLeft,
  toggle: ToggleRight,
  "toggle-group": CheckSquare,
  tooltip: MessageSquareText,
};

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
              <div>
                <div className="catalog-heading-line">
                  <h2 id={`catalog-${category}`}>{details.label}</h2>
                  <span className="catalog-count">{entries.length}</span>
                </div>
                <p>{details.description}</p>
              </div>
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
  const ComponentIcon = componentIcons[component.name] ?? Boxes;

  return (
    <Link
      href={`/docs/components/${component.name}`}
      className="catalog-card"
      data-accent={category}
    >
      <div className="catalog-glyph" aria-hidden>
        <ComponentIcon />
      </div>
      <div>
        <h3>{component.title}</h3>
        <p>{component.description}</p>
      </div>
      <ArrowUpRight className="catalog-arrow" aria-hidden />
    </Link>
  );
}
