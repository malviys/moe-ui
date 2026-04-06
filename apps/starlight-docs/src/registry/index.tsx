"use client";

import { Suspense, lazy } from "react";
import { ButtonPreview } from "./preview/button";

type ComponentPreviewProps = {
  name: string;
};

const PREVIEW_MAP: Record<string, ReturnType<typeof lazy>> = {
  // accordion
  accordion: lazy(() =>
    import("./preview/accordion").then((mod) => ({
      default: mod.AccordionPreview,
    })),
  ),
  "accordion/single": lazy(() =>
    import("./preview/accordion/single").then((mod) => ({
      default: mod.AccordionSingleTypePreview,
    })),
  ),
  "accordion/multiple": lazy(() =>
    import("./preview/accordion/multiple").then((mod) => ({
      default: mod.AccordionMultipleTypePreview,
    })),
  ),
  // alert
  alert: lazy(() =>
    import("./preview/alert").then((mod) => ({
      default: mod.AlertPreview,
    })),
  ),
  "alert/default": lazy(() =>
    import("./preview/alert/default").then((mod) => ({
      default: mod.AlertDefaultVariantPreview,
    })),
  ),
  "alert/destructive": lazy(() =>
    import("./preview/alert/destructive").then((mod) => ({
      default: mod.AlertDestructiveVariantPreview,
    })),
  ),
  "alert-dialog": lazy(() =>
    import("./preview/alert-dialog").then((mod) => ({
      default: mod.AlertDialogPreview,
    })),
  ),
  "aspect-ratio": lazy(() =>
    import("./preview/aspect-ratio").then((mod) => ({
      default: mod.AspectRatioPreview,
    })),
  ),
  // avatar
  avatar: lazy(() =>
    import("./preview/avatar").then((mod) => ({
      default: mod.AvatarPreview,
    })),
  ),
  "avatar/image": lazy(() =>
    import("./preview/avatar/image").then((mod) => ({
      default: mod.AvatarImageExamplePreview,
    })),
  ),
  "avatar/fallback": lazy(() =>
    import("./preview/avatar/fallback").then((mod) => ({
      default: mod.AvatarFallbackExamplePreview,
    })),
  ),
  "avatar/sizes": lazy(() =>
    import("./preview/avatar/sizes").then((mod) => ({
      default: mod.AvatarSizesExamplePreview,
    })),
  ),
  badge: lazy(() =>
    import("./preview/badge").then((mod) => ({
      default: mod.BadgePreview,
    })),
  ),
  // button
  button: lazy(() =>
    import("./preview/button").then((mod) => ({
      default: mod.ButtonPreview,
    })),
  ),
  "button/default": lazy(() =>
    import("./preview/button/default").then((mod) => ({
      default: mod.ButtonDefaultVariantPreview,
    })),
  ),
  "button/destructive": lazy(() =>
    import("./preview/button/destructive").then((mod) => ({
      default: mod.ButtonDestructiveVariantPreview,
    })),
  ),
  "button/ghost": lazy(() =>
    import("./preview/button/ghost").then((mod) => ({
      default: mod.ButtonGhostVariantPreview,
    })),
  ),
  "button/link": lazy(() =>
    import("./preview/button/link").then((mod) => ({
      default: mod.ButtonLinkVariantPreview,
    })),
  ),
  "button/outline": lazy(() =>
    import("./preview/button/outline").then((mod) => ({
      default: mod.ButtonOutlineVariantPreview,
    })),
  ),
  "button/secondary": lazy(() =>
    import("./preview/button/secondary").then((mod) => ({
      default: mod.ButtonSecondaryVariantPreview,
    })),
  ),
  "button/sizes": lazy(() =>
    import("./preview/button/sizes").then((mod) => ({
      default: mod.ButtonSizesPreview,
    })),
  ),
  card: lazy(() =>
    import("./preview/card").then((mod) => ({
      default: mod.CardPreview,
    })),
  ),
  checkbox: lazy(() =>
    import("./preview/checkbox").then((mod) => ({
      default: mod.CheckboxPreview,
    })),
  ),
  collapsible: lazy(() =>
    import("./preview/collapsible").then((mod) => ({
      default: mod.CollapsiblePreview,
    })),
  ),
  "context-menu": lazy(() =>
    import("./preview/context-menu").then((mod) => ({
      default: mod.ContextMenuPreview,
    })),
  ),
  dialog: lazy(() =>
    import("./preview/dialog").then((mod) => ({
      default: mod.DialogPreview,
    })),
  ),
  "dropdown-menu": lazy(() =>
    import("./preview/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenuPreview,
    })),
  ),
  "hover-card": lazy(() =>
    import("./preview/hover-card").then((mod) => ({
      default: mod.HoverCardPreview,
    })),
  ),
  input: lazy(() =>
    import("./preview/input").then((mod) => ({
      default: mod.InputPreview,
    })),
  ),
  label: lazy(() =>
    import("./preview/label").then((mod) => ({
      default: mod.LabelPreview,
    })),
  ),
  menubar: lazy(() =>
    import("./preview/menubar").then((mod) => ({
      default: mod.MenubarPreview,
    })),
  ),
  popover: lazy(() =>
    import("./preview/popover").then((mod) => ({
      default: mod.PopoverPreview,
    })),
  ),
  progress: lazy(() =>
    import("./preview/progress").then((mod) => ({
      default: mod.ProgressPreview,
    })),
  ),
  "radio-group": lazy(() =>
    import("./preview/radio-group").then((mod) => ({
      default: mod.RadioGroupPreview,
    })),
  ),
  select: lazy(() =>
    import("./preview/select").then((mod) => ({
      default: mod.SelectPreview,
    })),
  ),
  separator: lazy(() =>
    import("./preview/separator").then((mod) => ({
      default: mod.SeparatorPreview,
    })),
  ),
  sheet: lazy(() =>
    import("./preview/sheet").then((mod) => ({
      default: mod.SheetPreview,
    })),
  ),
  skeleton: lazy(() =>
    import("./preview/skeleton").then((mod) => ({
      default: mod.SkeletonPreview,
    })),
  ),
  switch: lazy(() =>
    import("./preview/switch").then((mod) => ({
      default: mod.SwitchPreview,
    })),
  ),
  tabs: lazy(() =>
    import("./preview/tabs").then((mod) => ({
      default: mod.TabsPreview,
    })),
  ),
  // text
  text: lazy(() =>
    import("./preview/text").then((mod) => ({
      default: mod.TextPreview,
    })),
  ),
  "text/typography": lazy(() =>
    import("./preview/text/typography").then((mod) => ({
      default: mod.TypographyPreview,
    })),
  ),
  textarea: lazy(() =>
    import("./preview/textarea").then((mod) => ({
      default: mod.TextareaPreview,
    })),
  ),
  "toggle-group": lazy(() =>
    import("./preview/toggle-group").then((mod) => ({
      default: mod.ToggleGroupPreview,
    })),
  ),
  toggle: lazy(() =>
    import("./preview/toggle").then((mod) => ({
      default: mod.TogglePreview,
    })),
  ),
  tooltip: lazy(() =>
    import("./preview/tooltip").then((mod) => ({
      default: mod.TooltipPreview,
    })),
  ),
};

export const Registry = ({ name }: ComponentPreviewProps) => {
  const Preview = PREVIEW_MAP[name];

  if (!Preview) {
    return (
      <div className="min-h-96 flex items-center justify-center text-muted-foreground text-sm">
        Preview not found: <code className="ml-1">{name}</code>
      </div>
    );
  }

  return (
    <div className="min-h-96 flex items-center justify-center">
      {/* <ButtonPreview /> */}
      <Suspense
        fallback={
          <div className="text-muted-foreground text-sm">Loading preview…</div>
        }
      >
        <Preview />
      </Suspense>
    </div>
  );
};
