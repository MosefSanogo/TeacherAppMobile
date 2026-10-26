import { COLORS } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const ThemeButton = ({
  name,
  onPress,
  style,
  textStyle,
  iconName,
  iconSize = 24,
  loader = false,
  iconColor,
}: {
  name?: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  iconName?: any;
  iconSize?: number;
  loader?: boolean;
  iconColor?: string;
}) => {
  const colorScheme = useColorScheme() || "light";
  const scale = new Animated.Value(1);
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={!loader ? onPress : undefined}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primaryDark,
          },
          pressed && !loader ? styles.pressed : null,
          style,
        ]}
      >
        <View style={styles.content}>
          {loader && (
            <ActivityIndicator
              size="small"
              color={iconColor || COLORS.white}
              style={{ marginRight: 8 }}
            />
          )}
          {!loader && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor || COLORS.white}
            />
          )}
          {name && (
            <Text style={[styles.text, { color: COLORS.white }, textStyle]}>
              {name}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default ThemeButton;

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginLeft: 15,
  },
});
