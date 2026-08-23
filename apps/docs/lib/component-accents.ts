import { getComponent } from "./registry";

export const componentCategories = [
  "foundation",
  "form",
  "navigation",
  "overlay",
  "feedback",
  "media",
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export const categoryDetails: Record<
  ComponentCategory,
  { label: string; description: string }
> = {
  foundation: {
    label: "Foundation",
    description: "The small, dependable pieces every interface starts with.",
  },
  form: {
    label: "Forms",
    description: "Controls for collecting choices, text, and intent.",
  },
  navigation: {
    label: "Navigation",
    description: "Patterns that help people move through layered content.",
  },
  overlay: {
    label: "Overlays",
    description: "Focus-managed content that appears above the current view.",
  },
  feedback: {
    label: "Feedback",
    description:
      "Status, progress, and contextual messages with clear meaning.",
  },
  media: {
    label: "Media",
    description:
      "Visual primitives with stable layout and accessible fallbacks.",
  },
};

export function getComponentCategory(name?: string): ComponentCategory {
  const category = name ? getComponent(name)?.category : undefined;

  return componentCategories.includes(category as ComponentCategory)
    ? (category as ComponentCategory)
    : "foundation";
}
