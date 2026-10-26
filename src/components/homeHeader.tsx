import { COLORS } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

const HomeHeader = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.viewIcone}>
          <Ionicons name={"school-outline"} size={28} color={COLORS.white} />
        </View>
        <View>
          <ThemedText type="title" style={{ fontSize: 18 }}>
            {title}
          </ThemedText>
          <ThemedText
            type="default"
            style={{ fontSize: 14, color: COLORS.textMuted }}
          >
            {subtitle}
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity onPress={() => {}} style={styles.touchable}>
        <Ionicons name="notifications-outline" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewIcone: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  touchable: {
    padding: 2,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
});
