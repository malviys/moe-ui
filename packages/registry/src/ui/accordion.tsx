import * as AccordionPrimitive from "@rn-primitives/accordion";
import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOutUp,
  LayoutAnimationConfig,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronDown } from "../lib/icons/ChevronDown";
import { cn } from "../lib/utils";
import { TextClassContext } from "./text";

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ children, ...props }, ref) => {
  return (
    <LayoutAnimationConfig skipEntering>
      <AccordionPrimitive.Root ref={ref} {...props}>
        <Animated.View layout={LinearTransition.duration(200)}>
          {children}
        </Animated.View>
      </AccordionPrimitive.Root>
    </LayoutAnimationConfig>
  );
});
Accordion.displayName = AccordionPrimitive.Root.displayName;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, value, ...props }, ref) => {
  return (
    <Animated.View
      className={"overflow-hidden"}
      layout={LinearTransition.duration(200)}
    >
      <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b border-border", className)}
        value={value}
        {...props}
      />
    </Animated.View>
  );
});
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  const progress = useDerivedValue(() =>
    isExpanded
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 200 }),
  );
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg`,
      },
    ],
    opacity: interpolate(progress.value, [0, 1], [1, 0.8], Extrapolation.CLAMP),
  }));

  return (
    <TextClassContext.Provider value="native:text-lg font-medium web:group-hover:underline">
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger ref={ref} {...props} asChild>
          <Pressable
            className={cn(
              "flex flex-1 flex-row items-center justify-between py-4 web:transition-all group web:focus-visible:outline-none web:focus-visible:ring-1 web:focus-visible:ring-ring",
              className,
            )}
          >
            <>{children}</>
            <Animated.View style={chevronStyle}>
              <ChevronDown
                size={18}
                className={cn("text-foreground shrink-0")}
              />
            </Animated.View>
          </Pressable>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    </TextClassContext.Provider>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();
  return (
    <TextClassContext.Provider value="native:text-base">
      <AccordionPrimitive.Content
        className={cn("overflow-hidden text-sm", className)}
        ref={ref}
        {...props}
      >
        <Animated.View
          entering={Platform.OS !== "web" ? FadeIn.duration(200) : undefined}
          exiting={Platform.OS !== "web" ? FadeOutUp.duration(200) : undefined}
        >
          <View className={cn("pb-4 pt-0", className)}>{children}</View>
        </Animated.View>
      </AccordionPrimitive.Content>
    </TextClassContext.Provider>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
