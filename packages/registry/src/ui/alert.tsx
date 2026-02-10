import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { cn } from "../lib/utils";
import { Text, TextClassContext } from "./text";

const alertVariants = cva(
  "relative w-full rounded-lg border border-border p-4 shadow shadow-foreground/5",
  {
    variants: {
      variant: {
        default: "bg-background",
        destructive: "border-destructive/50 dark:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof alertVariants> & {
      icon?: LucideIcon;
      iconSize?: number;
      iconClassName?: string;
    }
>(
  (
    {
      className,
      variant,
      children,
      icon: Icon,
      iconSize = 16,
      iconClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <View
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), !!Icon && "pl-12", className)}
        {...props}
      >
        {Icon && (
          <View className="absolute left-4 top-4 -translate-y-0.5">
            <Icon
              size={iconSize}
              className={cn(
                "text-foreground",
                variant === "destructive" && "text-destructive",
                iconClassName,
              )}
            />
          </View>
        )}
        <TextClassContext.Provider
          value={cn(
            "text-foreground",
            variant === "destructive" && "text-destructive",
          )}
        >
          {children}
        </TextClassContext.Provider>
      </View>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn(
      "mb-1 font-medium text-base leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
