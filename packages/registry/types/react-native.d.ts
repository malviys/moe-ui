import "react-native";

declare module "react-native" {
  interface TextInputProps {
    className?: string;
    placeholderClassName?: string;
  }
  interface ViewProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
}
