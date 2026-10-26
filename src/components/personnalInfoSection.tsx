import { Mail, Phone, School, User } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SIZES } from "@/constants/theme";

type PersonalInfoSectionProps = {
  name: string;
  email: string;
  phone?: string;
  ecole: string;
  style?: object;
};

export default function PersonalInfoSection({
  name,
  email,
  phone,
  ecole,
  style,
}: PersonalInfoSectionProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Informations personnelles</Text>

      <View style={styles.card}>
        <View style={styles.item}>
          <View style={styles.iconContainer}>
            <User size={SIZES.iconMD} color={COLORS.primary} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.item}>
          <View style={styles.iconContainer}>
            <Mail size={SIZES.iconMD} color={COLORS.primary} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
        </View>

        {phone && (
          <>
            <View style={styles.separator} />

            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Phone size={SIZES.iconMD} color={COLORS.primary} />
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>Téléphone</Text>
                <Text style={styles.value}>{phone}</Text>
              </View>
            </View>

            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <School size={SIZES.iconMD} color={COLORS.primary} />
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>Etablissement</Text>
                <Text style={styles.value}>{ecole}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spaceXL,
  },

  title: {
    fontSize: SIZES.textLG,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceMD,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLG,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.spaceMD,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceMD,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
    marginBottom: SIZES.spaceXS,
  },

  value: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 40 + SIZES.spaceMD * 2,
  },
});
