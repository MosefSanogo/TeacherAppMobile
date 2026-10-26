import { Pressable, StyleSheet, Text, View } from "react-native";

import { ChevronRight, LucideIcon } from "lucide-react-native";

import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { ThemedText } from "./themed-text";

type QuickActionCardProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  onPress?: () => void;
  style?: object;
};

const QuickActionCard = ({
  title,
  subtitle,
  icon: Icon,
  color = COLORS.primary,
  onPress,
  style,
}: QuickActionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {/* Icône */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Icon size={SIZES.iconMD} color={color} strokeWidth={2} />
      </View>

      {/* Texte */}
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {style && (
        <View>
          <ChevronRight
            size={SIZES.iconSM}
            strokeWidth={2}
            color={COLORS.textSecondary}
          />
        </View>
      )}
    </Pressable>
  );
};
export default QuickActionCard;
const styles = StyleSheet.create({
  card: {
    flex: 1,

    minHeight: 120,
    gap: 8,

    backgroundColor: COLORS.surface,

    borderRadius: SIZES.radiusLG,

    borderWidth: 1,
    borderColor: COLORS.border,

    padding: SIZES.spaceLG,

    margin: SIZES.spaceXS,

    ...SHADOWS.small,
  },
  pressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },
  iconContainer: {
    width: 45,
    height: 45,

    borderRadius: SIZES.radiusMD,

    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  title: {
    fontSize: SIZES.textMD,

    fontWeight: 600,

    color: COLORS.text,

    marginBottom: SIZES.spaceXS,
  },
  subtitle: {
    fontSize: SIZES.textXS,

    lineHeight: 17,

    color: COLORS.textSecondary,
  },
});
