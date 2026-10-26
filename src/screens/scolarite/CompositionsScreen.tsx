import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  GraduationCap,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import affectationService from "@/services/affectation.service";
import otherService from "@/services/other.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";

type Classe = {
  id: number;
  nom: string;
  niveau: string;
};

type Matiere = {
  id: number;
  nom: string;
};

type Periode = {
  id: number;
  nom: string;
};

type Examen = {
  id: number;
  lib: string;
  niveau: string;
  periode: string;
};

export default function CompositionsScreen() {
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);

  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);

  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);

  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);

  const [annee, setAnnee] = useState("2025-2026");
  const navigation = useNavigation<ScolariteStackNavigationProp>();
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
  const id = Number(userInfo?.id); // Remplacez par l'ID réel de l'utilisateur connecté
  const {
    data: affectationsData,
    isLoading: isAffectationsLoading,
    isError: isAffectionError,
    error: errorAffection,
  } = useQuery<any[]>({
    queryKey: ["affectations", id],
    queryFn: async () => {
      try {
        const data: any[] = await affectationService.getAffectations(id);
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const {
    data: periodesData,
    isLoading: isPeriodesLoading,
    isError: isPeriodeError,
    error: errorPeriode,
  } = useQuery<any[]>({
    queryKey: ["periodes"],
    queryFn: async () => {
      try {
        const data: any[] = await otherService.getPeriode();
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const classesFormated: Classe[] = useMemo(() => {
    if (!affectationsData) return [];
    return affectationsData.map((item: any) => ({
      id: item.idC,
      nom: item.name,
      niveau: item.niveau,
    }));
  }, [affectationsData]);

  const periodesFormated: Periode[] = useMemo(() => {
    if (!periodesData) return [];
    return periodesData.map((item: any) => ({
      id: item.id,
      nom: item.lib,
    }));
  }, [periodesData]);

  const {
    data: examensData,
    isLoading: isExamensLoading,
    isError: isExamError,
    error: errorExamen,
    refetch,
  } = useQuery<Examen[]>({
    queryKey: ["examens", selectedClasse?.niveau, selectedPeriode?.nom],
    queryFn: async () => {
      try {
        const data = await otherService.getExamen(
          selectedClasse?.niveau,
          selectedPeriode?.nom,
        );
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const matieres = useMemo(() => {
    if (!affectationsData || !selectedClasse) return [];

    return affectationsData
      .filter((item) => item.idC === selectedClasse.id)
      .map((item) => ({
        id: item.id,
        nom: item.matiere,
      }));
  }, [affectationsData, selectedClasse]);

  const handleClassePress = (classe: Classe) => {
    setSelectedClasse(classe);
    setSelectedMatiere(null);
    setSelectedPeriode(null);
    setSelectedExamen(null);
  };

  const handleMatierePress = (matiere: Matiere) => {
    setSelectedMatiere(matiere);
    setSelectedPeriode(null);
    setSelectedExamen(null);
  };

  const handlePeriodePress = (periode: Periode) => {
    setSelectedPeriode(periode);
    setSelectedExamen(null);
  };

  const handleContinue = () => {
    if (!selectedClasse) {
      Alert.alert("Information", "Veuillez sélectionner une classe.");
      return;
    }

    if (!selectedMatiere) {
      Alert.alert("Information", "Veuillez sélectionner une matière.");
      return;
    }

    if (!selectedPeriode) {
      Alert.alert("Information", "Veuillez sélectionner une période.");
      return;
    }

    if (!selectedExamen) {
      Alert.alert("Information", "Veuillez sélectionner un examen.");
      return;
    }
    navigation.navigate("SaisieNote", {
      noteForm: {
        noteSur: Number(20),
        matiere: selectedMatiere.nom,
        annee: annee,
        classeId: Number(selectedClasse.id),
        evalId: String(selectedExamen.id),
        type: "composition",
      },
    });
  };

  if (isAffectionError || isPeriodeError || isExamError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork =
      errorAffection?.message === "NETWORK_ERROR" || !errorAffection;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={errorAffection?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const canContinue =
    !!selectedClasse &&
    !!selectedMatiere &&
    !!selectedPeriode &&
    !!selectedExamen;

  return (
    <View style={styles.container}>
      <ThemeHarder
        title="Compositions"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Classe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir une classe</Text>
          <Text style={styles.sectionSubtitle}>Vos classes affectées</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {classesFormated?.map((classe) => {
              const selected = selectedClasse?.id === classe.id;

              return (
                <Pressable
                  key={classe.id}
                  onPress={() => handleClassePress(classe)}
                  style={[
                    styles.classCard,
                    selected && styles.classCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.classIcon,
                      selected && styles.classIconSelected,
                    ]}
                  >
                    <GraduationCap
                      size={SIZES.iconLG}
                      color={selected ? COLORS.white : COLORS.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.className,
                      selected && styles.classNameSelected,
                    ]}
                  >
                    {classe.nom}
                  </Text>

                  {selected && (
                    <View style={styles.check}>
                      <Check size={14} color={COLORS.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Matière */}
        {selectedClasse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir une matière</Text>
            <Text style={styles.sectionSubtitle}>
              Matières enseignées en {selectedClasse.nom}
            </Text>

            <View style={styles.list}>
              {matieres.map((matiere) => {
                const selected = selectedMatiere?.id === matiere.id;

                return (
                  <Pressable
                    key={matiere.id}
                    onPress={() => handleMatierePress(matiere)}
                    style={[
                      styles.listCard,
                      selected && styles.listCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        selected && styles.iconBoxSelected,
                      ]}
                    >
                      <BookOpen
                        size={SIZES.iconMD}
                        color={selected ? COLORS.white : COLORS.primary}
                      />
                    </View>

                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                      ]}
                    >
                      {matiere.nom}
                    </Text>

                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Période */}
        {selectedClasse && selectedMatiere && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir une période</Text>
            <Text style={styles.sectionSubtitle}>
              La période permet de récupérer les examens du niveau{" "}
              {selectedClasse.niveau}
            </Text>

            <View style={styles.periods}>
              {periodesFormated?.map((periode) => {
                const selected = selectedPeriode?.id === periode.id;

                return (
                  <Pressable
                    key={periode.id}
                    onPress={() => handlePeriodePress(periode)}
                    style={[
                      styles.periodCard,
                      selected && styles.periodCardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selected && styles.periodTextSelected,
                      ]}
                    >
                      {periode.nom}
                    </Text>

                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Examen */}
        {selectedClasse && selectedMatiere && selectedPeriode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un examen</Text>
            <Text style={styles.sectionSubtitle}>
              Examens disponibles pour {selectedClasse.niveau} —{" "}
              {selectedPeriode.nom}
            </Text>

            <View style={styles.list}>
              {examensData?.length === 0 ? (
                <View style={styles.emptyCard}>
                  <ClipboardList size={SIZES.iconLG} color={COLORS.textMuted} />

                  <Text style={styles.emptyTitle}>Aucun examen disponible</Text>

                  <Text style={styles.emptyText}>
                    Aucun examen n'a été créé par l'administration pour cette
                    période.
                  </Text>
                </View>
              ) : (
                examensData?.map((examen) => {
                  const selected = selectedExamen?.id === examen.id;

                  return (
                    <Pressable
                      key={examen.id}
                      onPress={() => setSelectedExamen(examen)}
                      style={[styles.listCard, selected && styles.examSelected]}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          selected && styles.examIconSelected,
                        ]}
                      >
                        <ClipboardList
                          size={SIZES.iconMD}
                          color={selected ? COLORS.white : COLORS.secondary}
                        />
                      </View>

                      <Text
                        style={[
                          styles.itemText,
                          selected && styles.examTextSelected,
                        ]}
                      >
                        {examen.lib}
                      </Text>

                      <View
                        style={[styles.radio, selected && styles.radioSelected]}
                      >
                        {selected && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        )}

        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !canContinue && styles.continueDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueText,
              !canContinue && styles.continueTextDisabled,
            ]}
          >
            Continuer
          </Text>

          <ChevronRight
            size={SIZES.iconMD}
            color={canContinue ? COLORS.white : COLORS.textMuted}
          />
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SIZES.spaceLG,
  },

  section: {
    marginBottom: SIZES.spaceXL,
  },

  sectionTitle: {
    fontSize: SIZES.textMD,
    fontWeight: "600",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: SIZES.spaceXS,
    marginBottom: SIZES.spaceMD,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },

  horizontalList: {
    paddingVertical: SIZES.spaceXS,
  },

  classCard: {
    width: 110,
    height: 105,
    marginRight: SIZES.spaceSM,
    padding: SIZES.spaceMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...SHADOWS.small,
  },

  classCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  classIcon: {
    width: 44,
    height: 44,
    marginBottom: SIZES.spaceSM,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  classIconSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  className: {
    fontSize: SIZES.textSM,
    fontWeight: "500",
    color: COLORS.text,
  },

  classNameSelected: {
    color: COLORS.white,
  },

  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    gap: SIZES.spaceSM,
  },

  listCard: {
    minHeight: 64,
    paddingHorizontal: SIZES.spaceMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.small,
  },

  listCardSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },

  iconBox: {
    width: 40,
    height: 40,
    marginRight: SIZES.spaceMD,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxSelected: {
    backgroundColor: COLORS.primary,
  },

  itemText: {
    flex: 1,
    fontSize: SIZES.textSM,
    fontWeight: "500",
    color: COLORS.text,
  },

  itemTextSelected: {
    color: COLORS.primary,
  },

  periods: {
    gap: SIZES.spaceSM,
  },

  periodCard: {
    minHeight: 52,
    paddingHorizontal: SIZES.spaceMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  periodText: {
    fontSize: SIZES.textSM,
    fontWeight: "500",
    color: COLORS.text,
  },

  periodTextSelected: {
    color: COLORS.primary,
  },

  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusFull,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
  },

  examSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },

  examIconSelected: {
    backgroundColor: COLORS.secondary,
  },

  examTextSelected: {
    color: COLORS.secondary,
  },

  emptyCard: {
    padding: SIZES.spaceXL,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: SIZES.spaceSM,
    fontSize: SIZES.textSM,
    fontWeight: "600",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  continueButton: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  continueDisabled: {
    backgroundColor: COLORS.border,
  },

  continueText: {
    fontSize: SIZES.textMD,
    fontWeight: "600",
    color: COLORS.white,
  },

  continueTextDisabled: {
    color: COLORS.textMuted,
  },

  bottomSpace: {
    height: SIZES.space2XL,
  },
});
