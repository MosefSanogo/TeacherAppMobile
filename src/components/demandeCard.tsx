import {
  CalendarOff,
  ChevronRight,
  ClipboardList,
  FileText,
  MoreHorizontal,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

type DemandeStatus = "pending" | "approved" | "rejected";

type DemandeCardProps = {
  title: string;
  description?: string;
  date: string;
  status: DemandeStatus;
  type?: "absence" | "document" | "administrative" | "other";
  onPress?: () => void;
};

const TYPE_CONFIG = {
  absence: {
    icon: CalendarOff,
    color: COLORS.warning,
    background: COLORS.warningLight,
  },
  document: {
    icon: FileText,
    color: COLORS.primary,
    background: COLORS.primaryLight,
  },
  administrative: {
    icon: ClipboardList,
    color: COLORS.secondary,
    background: COLORS.secondaryLight,
  },
  other: {
    icon: MoreHorizontal,
    color: COLORS.info,
    background: COLORS.infoLight,
  },
};

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    color: COLORS.warning,
    background: COLORS.warningLight,
  },
  approved: {
    label: "Acceptée",
    color: COLORS.success,
    background: COLORS.successLight,
  },
  rejected: {
    label: "Refusée",
    color: COLORS.danger,
    background: COLORS.dangerLight,
  },
};

export default function DemandeCard({
  title,
  description,
  date,
  status,
  type = "other",
  onPress,
}: DemandeCardProps) {
  const typeConfig = TYPE_CONFIG[type];
  const statusConfig = STATUS_CONFIG[status];

  const Icon = typeConfig.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: typeConfig.background },
        ]}
      >
        <Icon size={SIZES.iconLG} color={typeConfig.color} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title || "Demande sans titre"}
        </Text>

        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>{date}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.background },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.color },
              ]}
            />

            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={SIZES.iconMD} color={COLORS.textMuted} />
    </Pressable>
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
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceMD,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceXS,
  },

  description: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spaceSM,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  date: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.spaceSM,
    paddingVertical: SIZES.spaceXS,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: SIZES.radiusFull,
    marginRight: SIZES.spaceXS,
  },

  statusText: {
    fontSize: SIZES.textXS,
    fontWeight: 600,
  },
});
