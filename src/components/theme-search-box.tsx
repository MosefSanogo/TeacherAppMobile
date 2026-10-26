import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

export default function ThemedSearchBar({
  placeholder = "Rechercher...",
  onChangeText,
  value,
}: {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
}) {
  const colorScheme = useColorScheme() || "light";
  const [isFocused, setIsFocused] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Animation fluide au focus
  const animateFocus = (focus: boolean) => {
    Animated.timing(animation, {
      toValue: focus ? 1 : 0,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const animatedBorder = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const animatedShadow = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.15)"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.surface,
          borderColor: animatedBorder,
          shadowColor: animatedShadow,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={22}
        color={isFocused ? COLORS.primary : COLORS.text + "99"}
        style={{ marginHorizontal: 8 }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text + "99"}
        style={[styles.input, { color: COLORS.text }]}
        onFocus={() => {
          setIsFocused(true);
          animateFocus(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          animateFocus(false);
        }}
      />
      {value?.length ? (
        <Pressable onPress={() => onChangeText?.("")}>
          <Ionicons
            name="close-circle"
            size={20}
            color={COLORS.text + "66"}
            style={{ marginHorizontal: 6 }}
          />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
});
