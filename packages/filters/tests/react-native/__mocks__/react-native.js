/**
 * Minimal React Native mock for Jest + jsdom.
 * The mock strips RN-only props so React DOM warnings do not drown test output.
 */
const React = require("react");

// StyleSheet mock
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...style.map(StyleSheet.flatten));
    return style;
  },
  hairlineWidth: 1,
  absoluteFill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
};

function cleanProps(rest) {
  const {
    horizontal,
    showsHorizontalScrollIndicator,
    contentContainerStyle,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    hitSlop,
    onChangeText,
    onPress,
    testID,
    ...domProps
  } = rest;

  void horizontal;
  void showsHorizontalScrollIndicator;
  void contentContainerStyle;
  void onChangeText;
  void onPress;
  void testID;

  const accessibilityProps = {};
  if (accessibilityLabel !== undefined) {
    accessibilityProps["aria-label"] = accessibilityLabel;
  }
  if (accessibilityRole !== undefined) {
    accessibilityProps.role = accessibilityRole;
  }
  if (accessibilityState?.selected !== undefined) {
    accessibilityProps["aria-pressed"] = accessibilityState.selected;
  }
  if (accessibilityState?.expanded !== undefined) {
    accessibilityProps["aria-expanded"] = accessibilityState.expanded;
  }
  if (accessibilityState?.disabled !== undefined) {
    accessibilityProps["aria-disabled"] = accessibilityState.disabled;
  }
  if (accessibilityState?.checked !== undefined) {
    accessibilityProps["aria-checked"] = accessibilityState.checked;
  }
  if (hitSlop !== undefined) {
    accessibilityProps["data-hit-slop"] = String(hitSlop);
  }

  return {
    ...domProps,
    ...accessibilityProps,
  };
}

function createComponent(name, tagName = "div") {
  const Comp = React.forwardRef(
    ({ children, testID, onPress, ...rest }, ref) => {
      return React.createElement(
        tagName,
        {
          "data-testid": testID,
          ref,
          onClick: onPress,
          ...cleanProps(rest),
        },
        children,
      );
    },
  );
  Comp.displayName = name;
  return Comp;
}

const View = createComponent("View");
const Text = createComponent("Text", "span");
const ScrollView = createComponent("ScrollView");

const TextInput = React.forwardRef(
  ({ testID, onChangeText, value, placeholder, ...rest }, ref) => {
    return React.createElement("input", {
      "data-testid": testID,
      onChange: (e) => onChangeText?.(e.target.value),
      value: value ?? "",
      placeholder,
      ref,
      ...cleanProps(rest),
    });
  },
);
TextInput.displayName = "TextInput";

const Pressable = React.forwardRef(
  ({ children, testID, onPress, ...rest }, ref) => {
    return React.createElement(
      "div",
      {
        "data-testid": testID,
        onClick: onPress,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            onPress?.(event);
          }
        },
        ref,
        tabIndex: 0,
        role: "button",
        ...cleanProps(rest),
      },
      typeof children === "function" ? children({}) : children,
    );
  },
);
Pressable.displayName = "Pressable";

module.exports = {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform: { OS: "ios", select: (obj) => obj.ios ?? obj.default },
};
