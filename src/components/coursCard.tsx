import { COLORS, SIZES } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CoursCardProps = {
  matiere: string;
  classe: string;
  heureDebut: string;
  heureFin: string;
  salle?: string;
  couleur?: string;
  onPress?: () => void;
};

export default function CoursCard({
  matiere,
  classe,
  heureDebut,
  heureFin,
  salle,
  couleur = COLORS.primaryLight,
  onPress,
}: CoursCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Indicateur vertical */}
      <View style={[styles.indicator, { backgroundColor: couleur }]} />

      {/* Heure */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{heureDebut}</Text>
        <Text style={styles.timeSeparator}>—</Text>
        <Text style={styles.endTime}>{heureFin}</Text>
      </View>

      {/* Informations du cours */}
      <View style={styles.content}>
        <Text style={styles.matiere} numberOfLines={1}>
          {matiere}
        </Text>

        <Text style={styles.classe}>{classe}</Text>

        {salle && (
          <View style={styles.roomContainer}>
            <Text style={styles.roomIcon}>⌖</Text>
            <Text style={styles.room}>{salle}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 92,

    backgroundColor: COLORS.background,

    borderRadius: SIZES.radiusLG,
    borderWidth: 1,
    borderColor: COLORS.border,

    paddingVertical: SIZES.spaceMD,
    paddingRight: SIZES.spaceLG,

    marginBottom: SIZES.spaceMD,
  },

  pressed: {
    opacity: 0.7,
  },

  indicator: {
    width: 4,
    height: "70%",
    borderRadius: SIZES.radiusFull,
    marginRight: SIZES.spaceLG,
  },

  timeContainer: {
    width: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  time: {
    fontSize: SIZES.textMD,
    fontWeight: 800,
    color: COLORS.text,
  },

  timeSeparator: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
    marginVertical: 2,
  },

  endTime: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },

  content: {
    flex: 1,
    marginLeft: SIZES.spaceMD,
  },

  matiere: {
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceXS,
  },

  classe: {
    fontSize: SIZES.textMD,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spaceSM,
  },

  roomContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  roomIcon: {
    fontSize: SIZES.textSM,
    color: COLORS.textMuted,
    marginRight: SIZES.spaceSM,
  },

  room: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
  },
});
