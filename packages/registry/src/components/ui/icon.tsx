"use client";

import type { LucideIcon, LucideProps } from "lucide-react-native";
import { withMoeIcon } from "../../lib/moe-ui-styling";
import { cn } from "../../lib/utils";

type IconProps = LucideProps & {
  as: LucideIcon;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

const StyledIcon = withMoeIcon(IconImpl);

/**
 * A wrapper component for Lucide icons with styling-engine-aware `className` support.
 *
 * This component allows you to render any Lucide icon while applying utility classes
 * using the engine selected during Moe UI initialization.
 *
 * @component
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react-native';
 * import { Icon } from '@/registry/components/ui/icon';
 *
 * <Icon as={ArrowRight} className="text-red-500 size-4" />
 * ```
 *
 * @param {LucideIcon} as - The Lucide icon component to render.
 * @param {string} className - Utility classes to style the icon.
 * @param {number} size - Icon size (overrides the size class).
 * @param {...LucideProps} ...props - Additional Lucide icon props passed to the "as" icon.
 */
function Icon({ as: IconComponent, className, ...props }: IconProps) {
  return (
    <StyledIcon
      as={IconComponent}
      className={cn("text-foreground size-5", className)}
      {...props}
    />
  );
}

export { Icon };
