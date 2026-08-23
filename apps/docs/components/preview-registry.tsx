import { AccordionPreview } from "./preview/accordion";
import { AlertPreview } from "./preview/alert";
import AlertDialogPreview from "./preview/alert-dialog-preview";
import AspectRatioPreview from "./preview/aspect-ratio-preview";
import { AvatarPreview } from "./preview/avatar";
import BadgePreview from "./preview/badge-preview";
import { ButtonPreview } from "./preview/button";
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
import TextareaPreview from "./preview/textarea-preview";
import ToggleGroupPreview from "./preview/toggle-group-preview";
import TogglePreview from "./preview/toggle-preview";
import TooltipPreview from "./preview/tooltip-preview";

export const previewRegistry = {
  accordion: AccordionPreview,
  "alert-dialog": AlertDialogPreview,
  alert: AlertPreview,
  "aspect-ratio": AspectRatioPreview,
  avatar: AvatarPreview,
  badge: BadgePreview,
  button: ButtonPreview,
  card: CardPreview,
  checkbox: CheckboxPreview,
  collapsible: CollapsiblePreview,
  "context-menu": ContextMenuPreview,
  dialog: DialogPreview,
  "dropdown-menu": DropdownMenuPreview,
  "hover-card": HoverCardPreview,
  input: InputPreview,
  label: LabelPreview,
  menubar: MenubarPreview,
  popover: PopoverPreview,
  progress: ProgressPreview,
  "radio-group": RadioGroupPreview,
  select: SelectPreview,
  separator: SeparatorPreview,
  sheet: SheetPreview,
  skeleton: SkeletonPreview,
  switch: SwitchPreview,
  tabs: TabsPreview,
  text: TextPreview,
  textarea: TextareaPreview,
  "toggle-group": ToggleGroupPreview,
  toggle: TogglePreview,
  tooltip: TooltipPreview,
} as const;

export type PreviewName = keyof typeof previewRegistry;
