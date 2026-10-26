import { COLORS } from "@/constants/theme";
import { type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  return (
    <SafeAreaView
      style={[
        {
          backgroundColor: COLORS.background,
          paddingHorizontal: 0,
          marginHorizontal: 0,
        },
        style,
      ]}
      edges={["top"]}
      {...otherProps}
    />
  );
}
