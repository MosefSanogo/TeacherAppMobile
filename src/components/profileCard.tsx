import { User, VenetianMask } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

type ProfileCardProps = {
  name: string;
  role: string;
  matiere?: string;
  email?: string;
  style?: object;
};

export default function ProfileCard({
  name,
  role,
  matiere,
  email,
  style,
}: ProfileCardProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <Text style={styles.role}>{role}</Text>

        {matiere && (
          <View style={styles.row}>
            <VenetianMask size={SIZES.iconSM} color={COLORS.textSecondary} />
            <Text style={styles.detail} numberOfLines={1}>
              {matiere}
            </Text>
          </View>
        )}

        {email && (
          <View style={styles.row}>
            <User size={SIZES.iconSM} color={COLORS.textSecondary} />
            <Text style={styles.detail} numberOfLines={1}>
              {email}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.spaceLG,
    marginBottom: SIZES.spaceXL,
    ...SHADOWS.small,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceLG,
  },

  initials: {
    fontSize: SIZES.textLG,
    fontWeight: 800,
    color: COLORS.primary,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: SIZES.textLG,
    fontWeight: 800,
    color: COLORS.text,
    marginBottom: SIZES.spaceXS,
  },

  role: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spaceSM,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.spaceXS,
  },

  detail: {
    flex: 1,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spaceXS,
  },
});
