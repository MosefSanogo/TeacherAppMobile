import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import noteService from "@/services/note.service";

const NOTE_SUR = 20; // la requête ne renvoie pas le barème : on suppose /20

type Mode = "eval" | "compo";

type Params = {
  resultatEleve: {
    idEleve: number;
    nom: string;
    prenom: string;
    idC: number;
    annee: string;
    matieresProf: string[];
  };
};

type NoteRow = {
  id: number;
  mat: string;
  lib: string;
  note: number;
  periode: string | number | null;
  coef?: number;
};

const toNumber = (v: any) => (v === null || v === undefined ? 0 : Number(v));

const ResultatEleveScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const queryClient = useQueryClient();
  const { resultatEleve } = useRoute().params as Params;
  const { idEleve, nom, prenom, idC, annee, matieresProf } = resultatEleve;

  const [mode, setMode] = useState<Mode>("eval");
  const [editing, setEditing] = useState<NoteRow | null>(null);
  const [value, setValue] = useState("");

  const evalQuery = useQuery<any[]>({
    queryKey: ["notes-eval", idEleve, annee, idC],
    queryFn: async () =>
      (await noteService.getStudentNotes(idEleve, annee, idC)) ?? [],
  });

  const compoQuery = useQuery<any[]>({
    queryKey: ["notes-compo", idEleve, annee, idC],
    queryFn: async () =>
      (await noteService.getStudentCompo(idEleve, annee, idC)) ?? [],
  });

  const current = mode === "eval" ? evalQuery : compoQuery;

  // coefficient par matière (disponible seulement dans la requête des évaluations)
  const coefs = useMemo(() => {
    const map: Record<string, number> = {};
    (evalQuery.data ?? []).forEach((r) => {
      if (r.coef !== undefined && r.coef !== null) map[r.mat] = Number(r.coef);
    });
    return map;
  }, [evalQuery.data]);

  // lignes groupées par matière, matières du prof en premier
  const groupes = useMemo(() => {
    const map: Record<string, NoteRow[]> = {};
    (current.data ?? []).forEach((r) => {
      (map[r.mat] ??= []).push({
        id: r.id,
        mat: r.mat,
        lib: r.lib,
        note: toNumber(r.note),
        periode: r.periode ?? null,
        coef: coefs[r.mat],
      });
    });
    return Object.entries(map).sort(([a], [b]) => {
      const pa = matieresProf.includes(a) ? 0 : 1;
      const pb = matieresProf.includes(b) ? 0 : 1;
      return pa - pb || a.localeCompare(b);
    });
  }, [current.data, matieresProf, coefs]);

  const updateMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: number }) =>
      mode === "eval"
        ? noteService.updateNote(id, note)
        : noteService.updateCompo(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [mode === "eval" ? "notes-eval" : "notes-compo", idEleve],
      });
      setEditing(null);
    },
    onError: (error) => {
      Alert.alert("Erreur", "Impossible de modifier la note.");
    },
  });

  const openEdit = (row: NoteRow) => {
    setEditing(row);
    setValue(String(row.note));
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(",", ".").replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    if (cleaned !== "" && Number(cleaned) > NOTE_SUR) return;
    setValue(cleaned);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    if (value === "") {
      Alert.alert("Information", "Veuillez saisir une note.");
      return;
    }
    updateMutation.mutate({ id: editing.id, note: Number(value) });
  };

  const onRefresh = () => {
    evalQuery.refetch();
    compoQuery.refetch();
  };

  if (evalQuery.isError || compoQuery.isError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork =
      evalQuery.error?.message === "NETWORK_ERROR" || !evalQuery.error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={evalQuery.error?.message}
        onRetry={() => evalQuery.refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemeHarder
        title={`Résultat de ${prenom}`}
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />

      {/* Onglets */}
      <View style={styles.tabs}>
        {(
          [
            { key: "eval", label: "Évaluations" },
            { key: "compo", label: "Compositions" },
          ] as { key: Mode; label: string }[]
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setMode(tab.key)}
            style={[styles.tab, mode === tab.key && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, mode === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={evalQuery.isRefetching || compoQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <Text style={styles.subtitle}>
          {prenom} {nom} · année {annee}
        </Text>

        {current.isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SIZES.spaceXL }}
          />
        ) : current.isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>
              Impossible de charger les notes.
            </Text>
            <Pressable onPress={() => current.refetch()}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : groupes.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Aucune note</Text>
            <Text style={styles.emptyText}>
              Aucune {mode === "eval" ? "évaluation" : "composition"}{" "}
              enregistrée.
            </Text>
          </View>
        ) : (
          groupes.map(([matiere, rows]) => {
            const estMaMatiere = matieresProf.includes(matiere);
            return (
              <View key={matiere} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matiere}>{matiere}</Text>
                    {coefs[matiere] !== undefined && (
                      <Text style={styles.coef}>Coef. {coefs[matiere]}</Text>
                    )}
                  </View>
                  {estMaMatiere && (
                    <View style={styles.mineBadge}>
                      <Text style={styles.mineBadgeText}>Ma matière</Text>
                    </View>
                  )}
                </View>

                {rows.map((row, i) => (
                  <View
                    key={row.id}
                    style={[styles.noteRow, i > 0 && styles.noteRowBorder]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteLib}>{row.lib}</Text>
                      {row.periode !== null && (
                        <Text style={styles.notePeriode}>
                          Période {row.periode}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.noteValue}>
                      {row.note}
                      <Text style={styles.noteMax}> /{NOTE_SUR}</Text>
                    </Text>

                    {estMaMatiere && (
                      <Pressable
                        onPress={() => openEdit(row)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Modifier la note ${row.lib}`}
                        style={styles.editButton}
                      >
                        <Pencil size={16} color={COLORS.primary} />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal de modification */}
      <Modal
        visible={!!editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Modifier la note</Text>
            <Text style={styles.modalSub}>
              {editing?.mat} · {editing?.lib}
            </Text>

            <View style={styles.modalInputRow}>
              <TextInput
                value={value}
                onChangeText={handleChange}
                keyboardType="decimal-pad"
                maxLength={5}
                autoFocus
                selectTextOnFocus
                style={styles.modalInput}
              />
              <Text style={styles.noteMax}>/{NOTE_SUR}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditing(null)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={updateMutation.isPending}
                style={[styles.modalButton, styles.confirmButton]}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmText}>Enregistrer</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

export default ResultatEleveScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: "row",
    gap: SIZES.spaceSM,
    marginHorizontal: SIZES.spaceLG,
    marginTop: SIZES.spaceMD,
    padding: 4,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: SIZES.radiusSM,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.textSecondary,
  },
  tabTextActive: { color: COLORS.white },
  content: { paddingHorizontal: SIZES.spaceLG, paddingBottom: SIZES.space2XL },
  subtitle: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginTop: SIZES.spaceMD,
    marginBottom: SIZES.spaceLG,
  },
  card: {
    marginBottom: SIZES.spaceMD,
    padding: SIZES.spaceMD,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.spaceSM,
  },
  matiere: { fontSize: SIZES.textMD, fontWeight: 700, color: COLORS.text },
  coef: { marginTop: 2, fontSize: SIZES.textXS, color: COLORS.textSecondary },
  mineBadge: {
    paddingHorizontal: SIZES.spaceSM,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
  },
  mineBadgeText: { fontSize: 11, fontWeight: 600, color: COLORS.primary },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceMD,
    paddingVertical: SIZES.spaceSM,
  },
  noteRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  noteLib: { fontSize: SIZES.textSM, fontWeight: 500, color: COLORS.text },
  notePeriode: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  noteValue: { fontSize: SIZES.textMD, fontWeight: 700, color: COLORS.text },
  noteMax: { fontSize: SIZES.textXS, fontWeight: 400, color: COLORS.textMuted },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SIZES.space2XL,
    gap: SIZES.spaceSM,
  },
  emptyTitle: {
    marginTop: SIZES.spaceMD,
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
  },
  emptyText: {
    textAlign: "center",
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
  },
  errorText: { fontSize: SIZES.textSM, color: COLORS.danger },
  retryText: { fontSize: SIZES.textSM, fontWeight: 600, color: COLORS.primary },
  overlay: {
    flex: 1,
    backgroundColor: "#33333386",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.spaceLG,
  },
  modal: {
    width: "100%",
    padding: SIZES.spaceLG,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
  },
  modalTitle: { fontSize: SIZES.textLG, fontWeight: 700, color: COLORS.text },
  modalSub: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    marginVertical: SIZES.spaceLG,
  },
  modalInput: {
    width: 90,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.background,
    textAlign: "center",
    fontSize: SIZES.textLG,
    fontWeight: 600,
    color: COLORS.text,
  },
  modalActions: { flexDirection: "row", gap: SIZES.spaceSM },
  modalButton: {
    flex: 1,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusMD,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { borderWidth: 1, borderColor: COLORS.border },
  cancelText: { fontSize: SIZES.textMD, color: COLORS.text },
  confirmButton: { backgroundColor: COLORS.primary },
  confirmText: { fontSize: SIZES.textMD, fontWeight: 500, color: COLORS.white },
});
