import registry from "../../../packages/registry/registry.json";
import { componentPreviewVariants } from "./component-preview-manifest";

export const browserProjects = ["chromium", "firefox", "webkit"] as const;
export const themes = ["light", "dark"] as const;
export const viewports = ["desktop", "narrow"] as const;

const behaviorByCategory = {
  feedback: ["render", "semantics"],
  form: ["keyboard", "disabled", "form semantics"],
  foundation: ["render", "focus visibility"],
  media: ["render", "accessible name"],
  navigation: ["keyboard", "focus management", "disabled"],
  overlay: ["focus entry/return", "Escape", "outside interaction", "portal"],
} as const;

const behaviorOverrides: Record<string, readonly string[]> = {
  "alert-dialog": [
    "focus trap",
    "focus return",
    "Escape",
    "outside interaction",
  ],
  "context-menu": ["pointer open", "arrow keys", "nested menu", "Escape"],
  dialog: ["focus trap", "focus return", "Escape", "outside interaction"],
  "dropdown-menu": ["arrow keys", "nested menu", "Escape", "focus return"],
  menubar: ["arrow keys", "nested menu", "Escape", "focus return"],
  popover: ["focus entry/return", "Escape", "outside interaction", "portal"],
  select: ["arrow keys", "selection", "Escape", "disabled"],
  sheet: ["focus trap", "focus return", "Escape", "outside interaction"],
  tabs: ["arrow keys", "selection", "disabled"],
  tooltip: ["hover", "focus", "Escape", "accessible description"],
};

export const webTestManifest = registry.components.map((component) => ({
  ...component,
  route: `/docs/components/${component.name}`,
  selector: `[data-testid="preview-${component.name}"]`,
  previewVariants:
    componentPreviewVariants[
      component.name as keyof typeof componentPreviewVariants
    ] ?? [],
  behaviors:
    behaviorOverrides[component.name] ??
    behaviorByCategory[component.category as keyof typeof behaviorByCategory],
}));

export type WebTestComponent = (typeof webTestManifest)[number];
