import { Check, ChevronDown, CircleX, Save, Users } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import affectationService from "@/services/affectation.service";
import otherService from "@/services/other.service";
import studentService from "@/services/student.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";

type Classe = {
  id: number;
  nom: string;
};

type Matiere = {
  id: number;
  nom: string;
};

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
};

type StatutPresence = "present" | "absent";

const PresencesScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();

  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [statuts, setStatuts] = useState<Record<number, StatutPresence>>({});
  const [classePickerOpen, setClassePickerOpen] = useState(false);
  const [matierePickerOpen, setMatierePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [annee, setAnnee] = useState("2025-2026");
  const { userInfo } = useAuth();
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const ecole = await AsyncStorage.getItem("anneeScolaire");
        setAnnee(ecole || "");
      };
      load();
    }, []),
  );
  // Charger périodes + affectations
  const {
    data: affectationsData,
    isLoading: isAffectationsLoading,
    isError,
    error,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["affectations", Number(userInfo?.id)],
    queryFn: async () => {
      try {
        const data: any[] = await affectationService.getAffectations(
          Number(userInfo?.id),
        );
        return data;
      } catch (error) {
        return [];
      }
    },
  });
  const classesFormated: Classe[] = useMemo(() => {
    if (!affectationsData) return [];
    return affectationsData.map((item) => ({
      id: item.idC,
      nom: item.name,
    }));
  }, [affectationsData]);

  const matieres = useMemo(() => {
    if (!selectedClasse) return [];
    if (!affectationsData) return [];
    return affectationsData
      .filter((item) => item.idC === selectedClasse.id)
      .map((item) => ({
        id: item.id,
        nom: item.matiere,
      }));
  }, [affectationsData, selectedClasse]);
  console.log(matieres, classesFormated);
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentError,
  } = useQuery<any[]>({
    queryKey: ["student", selectedClasse?.id, annee, selectedMatiere?.id],
    queryFn: async () => {
      if (!selectedClasse || !selectedMatiere) {
        return [];
      }

      try {
        const data: any[] = await studentService.getStudents(
          selectedClasse.id,
          annee,
        );
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const elevesFormated: Eleve[] = useMemo(() => {
    if (!studentsData) return [];
    return studentsData.map((item) => ({
      id: item.id,
      nom: item.nom,
      prenom: item.prenom,
    }));
  }, [studentsData]);

  const presents = elevesFormated.filter(
    (eleve) => (statuts[eleve.id] ?? "present") === "present",
  ).length;

  const absents = elevesFormated.length - presents;

  const handleClasse = (classe: Classe) => {
    setSelectedClasse(classe);
    setSelectedMatiere(null);
    setStatuts({});
    setClassePickerOpen(false);
    setMatierePickerOpen(false);
  };

  const handleMatiere = (matiere: Matiere) => {
    setSelectedMatiere(matiere);
    setStatuts({});
    setMatierePickerOpen(false);
  };

  const handleStatut = (id: number, statut: StatutPresence) => {
    setStatuts((prev) => ({ ...prev, [id]: statut }));
  };

  const handleSave = async () => {
    setLoading(true);
    let absences = [];
    for (const eleve of elevesFormated) {
      if (statuts[eleve.id] === "absent") {
        absences.push({
          id: eleve.id,
          statut: "absent",
        });
      }
    }

    const form = {
      matiere: selectedMatiere?.nom,
      classe: selectedClasse?.id,
      annee: annee,
      date: new Date().toISOString().split("T")[0],
    };
    try {
      await otherService.createPresence(absences, form);
      setLoading(false);
      Alert.alert("Succès", "Les présences ont été enregistrées avec succès.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert("Erreur", "Erreur lors de l'enregistrement des présences.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  const renderEleve = ({ item, index }: { item: Eleve; index: number }) => {
    const statut = statuts[item.id] ?? "present";

    return (
      <View style={styles.studentRow}>
        <View style={styles.studentIdentity}>
          <View style={styles.studentNumber}>
            <Text style={styles.studentNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.nom}</Text>
            <Text style={styles.studentFirstName}>{item.prenom}</Text>
          </View>
        </View>

        <View style={styles.statusSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Marquer ${item.prenom} ${item.nom} présent`}
            onPress={() => handleStatut(item.id, "present")}
            style={[
              styles.statusButton,
              statut === "present" && styles.presentSelected,
            ]}
          >
            <Check
              size={15}
              color={statut === "present" ? COLORS.white : COLORS.success}
            />
            <Text
              style={[
                styles.statusText,
                statut === "present" && styles.selectedStatusText,
              ]}
            >
              Présent
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Marquer ${item.prenom} ${item.nom} absent`}
            onPress={() => handleStatut(item.id, "absent")}
            style={[
              styles.statusButton,
              statut === "absent" && styles.absentSelected,
            ]}
          >
            <CircleX
              size={15}
              color={statut === "absent" ? COLORS.white : COLORS.danger}
            />
            <Text
              style={[
                styles.statusText,
                statut === "absent" && styles.selectedStatusText,
              ]}
            >
              Absent
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isError || isStudentError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork = error?.message === "NETWORK_ERROR" || !error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemeHarder
        title="Présences"
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ListHeaderComponent */}
        <View>
          <Text style={styles.subtitle}>
            Suivez les présences de vos élèves.
          </Text>

          <Text style={styles.label}>Classe</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => {
              setClassePickerOpen((open) => !open);
              setMatierePickerOpen(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedClasse && styles.placeholder,
              ]}
            >
              {selectedClasse?.nom ?? "Choisir une classe"}
            </Text>
            <ChevronDown size={20} color={COLORS.textSecondary} />
          </Pressable>

          {classePickerOpen && (
            <View style={styles.optionsList}>
              {classesFormated.map((classe) => (
                <Pressable
                  key={classe.id}
                  style={styles.option}
                  onPress={() => handleClasse(classe)}
                >
                  <Text style={styles.optionText}>{classe.nom}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {selectedClasse && (
            <>
              <Text style={styles.label}>Matière</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => {
                  setMatierePickerOpen((open) => !open);
                  setClassePickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedMatiere && styles.placeholder,
                  ]}
                >
                  {selectedMatiere?.nom ?? "Choisir une matière"}
                </Text>
                <ChevronDown size={20} color={COLORS.textSecondary} />
              </Pressable>

              {matierePickerOpen && (
                <View style={styles.optionsList}>
                  {matieres.map((matiere) => (
                    <Pressable
                      key={matiere.id}
                      style={styles.option}
                      onPress={() => handleMatiere(matiere)}
                    >
                      <Text style={styles.optionText}>{matiere.nom}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}

          {selectedClasse && selectedMatiere && (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Users size={20} color={COLORS.primary} />
                  <Text style={styles.summaryTitle}>
                    {selectedClasse.nom} · {selectedMatiere.nom}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {elevesFormated.length}
                    </Text>
                    <Text style={styles.statLabel}>Élèves</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>
                      {presents}
                    </Text>
                    <Text style={styles.statLabel}>Présents</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: COLORS.danger }]}>
                      {absents}
                    </Text>
                    <Text style={styles.statLabel}>Absents</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Liste des élèves</Text>
              <Text style={styles.helperText}>
                Tous les élèves sont présents par défaut.
              </Text>
            </>
          )}
        </View>

        {/* data + renderItem */}
        {elevesFormated.length > 0 &&
          elevesFormated.map((item, index) => (
            <View key={String(item.id)}>{renderEleve({ item, index })}</View>
          ))}
        {isStudentsLoading && (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        )}
        {/* ListEmptyComponent */}
        {elevesFormated.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>
              {!selectedClasse
                ? "Choisissez une classe"
                : !selectedMatiere
                  ? "Choisissez une matière"
                  : "Aucun élève"}
            </Text>
            <Text style={styles.emptyText}>
              {!selectedClasse
                ? "Sélectionnez une classe pour continuer."
                : !selectedMatiere
                  ? "Sélectionnez la matière enseignée."
                  : "Aucun élève trouvé dans cette classe."}
            </Text>
          </View>
        )}
      </ScrollView>
      {selectedClasse && selectedMatiere && (
        <View style={styles.bottomContainer}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
          >
            <Save size={SIZES.iconMD} color={COLORS.white} />

            <Text style={styles.saveButtonText}>Enregistrer les notes</Text>
          </Pressable>
        </View>
      )}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </ThemedView>
  );
};

export default PresencesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  subtitle: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spaceLG,
    marginTop: SIZES.spaceMD,
  },
  label: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceSM,
    marginTop: SIZES.spaceSM,
  },
  dropdown: {
    minHeight: SIZES.inputHeight,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spaceLG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: SIZES.textMD,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  optionsList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    marginTop: SIZES.spaceXS,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  option: {
    paddingHorizontal: SIZES.spaceLG,
    paddingVertical: SIZES.spaceMD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: SIZES.textMD,
    color: COLORS.text,
  },
  summaryCard: {
    marginTop: SIZES.spaceXL,
    padding: SIZES.spaceLG,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceSM,
    marginBottom: SIZES.spaceLG,
  },
  summaryTitle: {
    flex: 1,
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    gap: SIZES.spaceXS,
  },
  statValue: {
    fontSize: SIZES.textXL,
    fontWeight: 700,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    marginTop: SIZES.spaceXL,
    fontSize: SIZES.textLG,
    fontWeight: 700,
    color: COLORS.text,
  },
  helperText: {
    marginTop: SIZES.spaceXS,
    marginBottom: SIZES.spaceMD,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SIZES.spaceLG,
    paddingBottom: 100,
  },
  studentRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SIZES.spaceSM,
    paddingVertical: SIZES.spaceMD,
    paddingHorizontal: SIZES.spaceMD,
    marginBottom: SIZES.spaceSM,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceSM,
  },
  studentNumber: {
    width: 30,
    height: 30,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  studentNumberText: {
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
  },
  studentFirstName: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  statusSelector: {
    flexDirection: "row",
    gap: SIZES.spaceXS,
  },
  statusButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: SIZES.spaceSM,
    borderRadius: SIZES.radiusSM,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  presentSelected: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  absentSelected: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 500,
    color: COLORS.textSecondary,
  },
  selectedStatusText: {
    color: COLORS.white,
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

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.spaceMD,
    paddingBottom: SIZES.spaceLG,
  },

  saveButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  saveButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  saveButtonText: {
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.white,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    backgroundColor: "#33333386",
    justifyContent: "center",
    alignItems: "center",
  },
});
