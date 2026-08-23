import { Fragment, type PropsWithChildren } from "react";
import { View } from "react-native";

const transition = {
  duration: () => transition,
  damping: () => transition,
  springify: () => transition,
  stiffness: () => transition,
  withInitialValues: () => transition,
};

export const FadeIn = transition;
export const FadeOut = transition;
export const FadeInDown = transition;
export const FadeInUp = transition;
export const FadeOutUp = transition;
export const LinearTransition = transition;

export const Extrapolation = { CLAMP: "clamp" } as const;

export function LayoutAnimationConfig({
  children,
}: PropsWithChildren<{ skipEntering?: boolean }>) {
  return <Fragment>{children}</Fragment>;
}

export function useSharedValue<T>(value: T) {
  return { value };
}

export function useDerivedValue<T>(factory: () => T) {
  return { value: factory() };
}

export function useAnimatedStyle<T>(factory: () => T) {
  return factory();
}

export function withTiming<T>(value: T) {
  return value;
}

export function withSpring<T>(value: T) {
  return value;
}

export function withRepeat<T>(value: T) {
  return value;
}

export function interpolate(value: number, input: number[], output: number[]) {
  const [inputStart = 0, inputEnd = 1] = input;
  const [outputStart = 0, outputEnd = 1] = output;
  const ratio =
    inputEnd === inputStart
      ? 0
      : (value - inputStart) / (inputEnd - inputStart);
  return outputStart + ratio * (outputEnd - outputStart);
}

const Animated = { View };

export default Animated;
