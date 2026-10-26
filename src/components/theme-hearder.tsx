import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

const ThemeHarder = ({
  title,
  style,
  onBackPress,
}: {
  title: string;
  style?: object;
  onBackPress?: () => void;
}) => {
  return (
    <>
      <View
        style={[styles.title, { backgroundColor: COLORS.primary }, style]}
      ></View>
      <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <ThemedText
          style={{
            color: COLORS.white,
            fontSize: 17,
            width: "100%",
            textAlign: "center",
            fontWeight: "bold",
          }}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
      </View>
    </>
  );
};

export default ThemeHarder;

const styles = StyleSheet.create({
  title: {
    height: 32,
    width: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
});
