import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  return {
    colorScheme: colorScheme ?? "light",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme: () => {},
    toggleColorScheme: () => {},
  };
}
