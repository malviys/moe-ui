import type { ComponentType } from "react";
import { componentPreviewVariants } from "@/lib/component-preview-manifest";
import { AccordionPreview } from "./preview/accordion";
import { AccordionMultipleTypePreview } from "./preview/accordion/multiple";
import { AccordionSingleTypePreview } from "./preview/accordion/single";
import { AlertPreview } from "./preview/alert";
import { AlertDefaultVariantPreview } from "./preview/alert/default";
import { AlertDestructiveVariantPreview } from "./preview/alert/destructive";
import AlertDialogPreview from "./preview/alert-dialog-preview";
import AspectRatioPreview from "./preview/aspect-ratio-preview";
import { AvatarPreview } from "./preview/avatar";
import { AvatarFallbackExamplePreview } from "./preview/avatar/fallback";
import { AvatarImageExamplePreview } from "./preview/avatar/image";
import { AvatarSizesExamplePreview } from "./preview/avatar/sizes";
import BadgePreview, {
  BadgeDestructivePreview,
  BadgeOutlinePreview,
  BadgeSecondaryPreview,
} from "./preview/badge-preview";
import { ButtonPreview } from "./preview/button";
import { ButtonDefaultVariantPreview } from "./preview/button/default";
import { ButtonDestructiveVariantPreview } from "./preview/button/destructive";
import { ButtonGhostVariantPreview } from "./preview/button/ghost";
import { ButtonLinkVariantPreview } from "./preview/button/link";
import { ButtonOutlineVariantPreview } from "./preview/button/outline";
import { ButtonSecondaryVariantPreview } from "./preview/button/secondary";
import { ButtonSizesPreview } from "./preview/button/sizes";
import CardPreview from "./preview/card-preview";
import CheckboxPreview from "./preview/checkbox-preview";
import CollapsiblePreview from "./preview/collapsible-preview";
import ContextMenuPreview from "./preview/context-menu-preview";
import DialogPreview from "./preview/dialog-preview";
import DropdownMenuPreview from "./preview/dropdown-menu-preview";
import HoverCardPreview from "./preview/hover-card-preview";
import InputPreview from "./preview/input-preview";
import LabelPreview from "./preview/label-preview";
import MenubarPreview from "./preview/menubar-preview";
import PopoverPreview from "./preview/popover-preview";
import ProgressPreview from "./preview/progress-preview";
import RadioGroupPreview from "./preview/radio-group-preview";
import SelectPreview from "./preview/select-preview";
import SeparatorPreview from "./preview/separator-preview";
import SheetPreview from "./preview/sheet-preview";
import SkeletonPreview from "./preview/skeleton-preview";
import SwitchPreview from "./preview/switch-preview";
import TabsPreview from "./preview/tabs-preview";
import { TextPreview } from "./preview/text";
import { TypographyPreview } from "./preview/text/typography";
import TextareaPreview from "./preview/textarea-preview";
import ToggleGroupPreview, {
  ToggleGroupOutlinePreview,
  ToggleGroupSizesPreview,
} from "./preview/toggle-group-preview";
import TogglePreview, {
  ToggleOutlinePreview,
  ToggleSizesPreview,
} from "./preview/toggle-preview";
import TooltipPreview from "./preview/tooltip-preview";

export type PreviewVariant = {
  id: string;
  label: string;
  Preview: ComponentType;
};

type PreviewDefinition = {
  Preview: ComponentType;
  variants?: readonly PreviewVariant[];
};

const definePreview = (
  Preview: ComponentType,
  variants?: readonly PreviewVariant[],
): PreviewDefinition => ({ Preview, variants });

function defineVariants<
  Name extends keyof typeof componentPreviewVariants,
  Id extends (typeof componentPreviewVariants)[Name][number]["id"],
>(name: Name, previews: Record<Id, ComponentType>): readonly PreviewVariant[] {
  return componentPreviewVariants[name].map(({ id, label }) => ({
    id,
    label,
    Preview: previews[id as Id],
  }));
}

export const previewRegistry = {
  accordion: definePreview(
    AccordionPreview,
    defineVariants("accordion", {
      single: AccordionSingleTypePreview,
      multiple: AccordionMultipleTypePreview,
    }),
  ),
  "alert-dialog": definePreview(AlertDialogPreview),
  alert: definePreview(
    AlertPreview,
    defineVariants("alert", {
      default: AlertDefaultVariantPreview,
      destructive: AlertDestructiveVariantPreview,
    }),
  ),
  "aspect-ratio": definePreview(AspectRatioPreview),
  avatar: definePreview(
    AvatarPreview,
    defineVariants("avatar", {
      image: AvatarImageExamplePreview,
      fallback: AvatarFallbackExamplePreview,
      sizes: AvatarSizesExamplePreview,
    }),
  ),
  badge: definePreview(
    BadgePreview,
    defineVariants("badge", {
      default: BadgePreview,
      secondary: BadgeSecondaryPreview,
      destructive: BadgeDestructivePreview,
      outline: BadgeOutlinePreview,
    }),
  ),
  button: definePreview(
    ButtonPreview,
    defineVariants("button", {
      default: ButtonDefaultVariantPreview,
      secondary: ButtonSecondaryVariantPreview,
      destructive: ButtonDestructiveVariantPreview,
      outline: ButtonOutlineVariantPreview,
      ghost: ButtonGhostVariantPreview,
      link: ButtonLinkVariantPreview,
      sizes: ButtonSizesPreview,
    }),
  ),
  card: definePreview(CardPreview),
  checkbox: definePreview(CheckboxPreview),
  collapsible: definePreview(CollapsiblePreview),
  "context-menu": definePreview(ContextMenuPreview),
  dialog: definePreview(DialogPreview),
  "dropdown-menu": definePreview(DropdownMenuPreview),
  "hover-card": definePreview(HoverCardPreview),
  input: definePreview(InputPreview),
  label: definePreview(LabelPreview),
  menubar: definePreview(MenubarPreview),
  popover: definePreview(PopoverPreview),
  progress: definePreview(ProgressPreview),
  "radio-group": definePreview(RadioGroupPreview),
  select: definePreview(SelectPreview),
  separator: definePreview(SeparatorPreview),
  sheet: definePreview(SheetPreview),
  skeleton: definePreview(SkeletonPreview),
  switch: definePreview(SwitchPreview),
  tabs: definePreview(TabsPreview),
  text: definePreview(
    TextPreview,
    defineVariants("text", {
      default: TextPreview,
      typography: TypographyPreview,
    }),
  ),
  textarea: definePreview(TextareaPreview),
  "toggle-group": definePreview(
    ToggleGroupPreview,
    defineVariants("toggle-group", {
      default: ToggleGroupPreview,
      outline: ToggleGroupOutlinePreview,
      sizes: ToggleGroupSizesPreview,
    }),
  ),
  toggle: definePreview(
    TogglePreview,
    defineVariants("toggle", {
      default: TogglePreview,
      outline: ToggleOutlinePreview,
      sizes: ToggleSizesPreview,
    }),
  ),
  tooltip: definePreview(TooltipPreview),
} as const;

export type PreviewName = keyof typeof previewRegistry;
