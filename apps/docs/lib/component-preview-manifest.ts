export const componentPreviewVariants = {
  accordion: [
    { id: "single", label: "Single" },
    { id: "multiple", label: "Multiple" },
  ],
  alert: [
    { id: "default", label: "Default" },
    { id: "destructive", label: "Destructive" },
  ],
  avatar: [
    { id: "image", label: "Image" },
    { id: "fallback", label: "Fallback" },
    { id: "sizes", label: "Sizes" },
  ],
  badge: [
    { id: "default", label: "Default" },
    { id: "secondary", label: "Secondary" },
    { id: "destructive", label: "Destructive" },
    { id: "outline", label: "Outline" },
  ],
  button: [
    { id: "default", label: "Default" },
    { id: "secondary", label: "Secondary" },
    { id: "destructive", label: "Destructive" },
    { id: "outline", label: "Outline" },
    { id: "ghost", label: "Ghost" },
    { id: "link", label: "Link" },
    { id: "sizes", label: "Sizes" },
  ],
  text: [
    { id: "default", label: "Default" },
    { id: "typography", label: "Typography variants" },
  ],
  toggle: [
    { id: "default", label: "Default" },
    { id: "outline", label: "Outline" },
    { id: "sizes", label: "Sizes" },
  ],
  "toggle-group": [
    { id: "default", label: "Default" },
    { id: "outline", label: "Outline" },
    { id: "sizes", label: "Sizes" },
  ],
} as const;

export type VariantPreviewName = keyof typeof componentPreviewVariants;
