import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Calendar,
  CircleX,
  GraduationCap,
  MapPin,
  Trash2,
  User,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import studentService from "@/services/student.service";

type RouteParams = {
  idEleve: number;
  mat: string;
  idC: number;
  annee: string;
};

type Admission = {
  nom: string;
  prenom: string;
  sexe: string;
  dob: string;
  pob: string;
  date: string;
};

type Matricule = { id: number; IdE: number; matricule: string };

type Presence = {
  id: number;
  idE: number;
  mat: string;
  idC: number;
  type: string;
  annee: string;
  date: string;
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatSexe = (sexe?: string) => {
  const s = sexe?.toLowerCase();
  if (s === "m" || s === "masculin") return "Masculin";
  if (s === "f" || s === "feminin" || s === "féminin") return "Féminin";
  return sexe || "-";
};

// l'API peut renvoyer un objet ou un tableau d'un seul élément
const first = <T,>(data: T | T[] | undefined | null): T | null =>
  Array.isArray(data) ? (data[0] ?? null) : (data ?? null);

const StudentProfilScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const queryClient = useQueryClient();
  const { studentProfil } = useRoute().params as { studentProfil: RouteParams };
  const { idEleve, mat, idC, annee } = studentProfil;

  const admissionQuery = useQuery({
    queryKey: ["admission", idEleve],
    queryFn: async () =>
      first<Admission>(await studentService.getAdmission(idEleve)),
  });

  const matriculeQuery = useQuery({
    queryKey: ["matricule", idEleve],
    queryFn: async () =>
      first<Matricule>(await studentService.getMatricule(idEleve)),
  });

  const presenceQuery = useQuery({
    queryKey: ["presences", idEleve, annee],
    queryFn: async () => {
      const data: Presence[] = await studentService.getPresence(idEleve, annee);
      return data ?? [];
    },
  });

  // uniquement les absences enregistrées par ce prof (matière + classe)
  const presences = useMemo(() => {
    return (presenceQuery.data ?? [])
      .filter((p) => p.mat === mat && Number(p.idC) === Number(idC))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [presenceQuery.data, mat, idC]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentService.deletePresence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presences", idEleve] });
      ToastAndroid.show(
        "Presence a été effacée avec succès",
        ToastAndroid.SHORT,
      );
    },
    onError: (error) => {
      Alert.alert("Erreur", "Impossible de supprimer cette absence.");
    },
  });

  const handleDelete = (presence: Presence) => {
    Alert.alert(
      "Supprimer l'absence",
      `Voulez-vous supprimer l'absence du ${formatDate(presence.date)} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteMutation.mutate(presence.id),
        },
      ],
    );
  };

  const isRefreshing =
    admissionQuery.isRefetching ||
    matriculeQuery.isRefetching ||
    presenceQuery.isRefetching;

  const onRefresh = () => {
    admissionQuery.refetch();
    matriculeQuery.refetch();
    presenceQuery.refetch();
  };

  const admission = admissionQuery.data;
  const matricule = matriculeQuery.data;
  const initiales = admission
    ? `${admission.prenom?.[0] ?? ""}${admission.nom?.[0] ?? ""}`.toUpperCase()
    : "";

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (
    admissionQuery.isError ||
    presenceQuery.isError ||
    matriculeQuery.isError
  ) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork =
      admissionQuery?.error?.message === "NETWORK_ERROR" ||
      !admissionQuery.error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={admissionQuery?.error?.message}
        onRetry={() => admissionQuery.refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemeHarder
        title="Profil de l'élève"
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Identité */}
        {admissionQuery.isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SIZES.spaceXL }}
          />
        ) : admissionQuery.isError || !admission ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Impossible de charger les informations de l'élève.
            </Text>
            <Pressable onPress={() => admissionQuery.refetch()}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initiales}</Text>
              </View>
              <Text style={styles.fullName}>
                {admission.prenom} {admission.nom}
              </Text>
              <View style={styles.matriculeBadge}>
                <BadgeCheck size={14} color={COLORS.primary} />
                <Text style={styles.matriculeText}>
                  {matriculeQuery.isLoading
                    ? "Chargement..."
                    : (matricule?.matricule ?? "Matricule non attribué")}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.card}>
              <InfoRow
                icon={<User size={18} color={COLORS.primary} />}
                label="Sexe"
                value={formatSexe(admission.sexe)}
              />
              <View style={styles.divider} />
              <InfoRow
                icon={<Calendar size={18} color={COLORS.primary} />}
                label="Date de naissance"
                value={formatDate(admission.dob)}
              />
              <View style={styles.divider} />
              <InfoRow
                icon={<MapPin size={18} color={COLORS.primary} />}
                label="Lieu de naissance"
                value={admission.pob || "-"}
              />
              <View style={styles.divider} />
              <InfoRow
                icon={<GraduationCap size={18} color={COLORS.primary} />}
                label="Année d'admission"
                value={admission.date || "-"}
              />
            </View>
          </>
        )}

        {/* Absences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Absences enregistrées</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{presences.length}</Text>
          </View>
        </View>
        <Text style={styles.helperText}>
          {mat} · année {annee}
        </Text>

        {presenceQuery.isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SIZES.spaceLG }}
          />
        ) : presences.length === 0 ? (
          <View style={styles.emptyState}>
            <BadgeCheck size={36} color={COLORS.success} />
            <Text style={styles.emptyTitle}>Aucune absence</Text>
            <Text style={styles.emptyText}>
              Cet élève n'a aucune absence enregistrée dans votre matière.
            </Text>
          </View>
        ) : (
          presences.map((presence) => (
            <View key={presence.id} style={styles.presenceRow}>
              <View style={styles.presenceIcon}>
                <CircleX size={18} color={COLORS.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.presenceType}>Absent</Text>
                <Text style={styles.presenceDate}>
                  {formatDate(presence.date)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(presence)}
                disabled={deleteMutation.isPending}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Supprimer cette absence"
                style={styles.deleteButton}
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === presence.id ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Trash2 size={18} color={COLORS.danger} />
                )}
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

export default StudentProfilScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: SIZES.spaceLG,
    paddingBottom: SIZES.space2XL,
  },
  profileCard: {
    alignItems: "center",
    marginTop: SIZES.spaceMD,
    padding: SIZES.spaceLG,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: SIZES.textXL,
    fontWeight: 700,
    color: COLORS.primary,
  },
  fullName: {
    marginTop: SIZES.spaceMD,
    fontSize: SIZES.textLG,
    fontWeight: 700,
    color: COLORS.text,
    textAlign: "center",
  },
  matriculeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceXS,
    marginTop: SIZES.spaceSM,
    paddingHorizontal: SIZES.spaceMD,
    paddingVertical: SIZES.spaceXS,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
  },
  matriculeText: {
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.primary,
  },
  sectionTitle: {
    marginTop: SIZES.spaceXL,
    fontSize: SIZES.textLG,
    fontWeight: 700,
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceSM,
  },
  countBadge: {
    marginTop: SIZES.spaceXL,
    minWidth: 24,
    height: 24,
    paddingHorizontal: SIZES.spaceSM,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { fontSize: SIZES.textXS, fontWeight: 600, color: COLORS.white },
  helperText: {
    marginTop: SIZES.spaceXS,
    marginBottom: SIZES.spaceMD,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  card: {
    marginTop: SIZES.spaceMD,
    padding: SIZES.spaceMD,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceMD,
    paddingVertical: SIZES.spaceSM,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: SIZES.textXS, color: COLORS.textSecondary },
  infoValue: {
    marginTop: 2,
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  presenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceMD,
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceSM,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presenceIcon: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  presenceType: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.danger,
  },
  presenceDate: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SIZES.space2XL,
    paddingHorizontal: SIZES.spaceLG,
  },
  emptyTitle: {
    marginTop: SIZES.spaceMD,
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
  },
  emptyText: {
    marginTop: SIZES.spaceXS,
    textAlign: "center",
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
  },
  errorBox: {
    alignItems: "center",
    paddingVertical: SIZES.spaceXL,
    gap: SIZES.spaceSM,
  },
  errorText: {
    fontSize: SIZES.textSM,
    color: COLORS.danger,
    textAlign: "center",
  },
  retryText: { fontSize: SIZES.textSM, fontWeight: 600, color: COLORS.primary },
});
