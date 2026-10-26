import { COLORS } from "@/constants/theme";
import React, { useState } from "react";
import { TextInput, useColorScheme } from "react-native";

const ThemeTextInput = ({
  style,
  ...props
}: React.ComponentProps<typeof TextInput>) => {
  const colorScheme = useColorScheme() || "light";
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      style={[
        {
          backgroundColor: COLORS.surface,
          borderColor: isFocused
            ? COLORS.primary // 🔥 couleur quand le champ est focus
            : COLORS.border, // couleur normale
          color: COLORS.text,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          fontSize: 14,
        },
        style,
      ]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholderTextColor={COLORS.textSecondary}
      {...props}
    />
  );
};

export default ThemeTextInput;
