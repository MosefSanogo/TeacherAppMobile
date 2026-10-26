import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { ChevronDown, ChevronRight, Users } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import ThemedSearchBar from "@/components/theme-search-box";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import affectationService from "@/services/affectation.service";
import studentService from "@/services/student.service";

type Classe = { id: number; nom: string };
type Eleve = { id: number; nom: string; prenom: string };

const ResultatScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const { userInfo } = useAuth();
  const id = Number(userInfo?.id);

  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [annee, setAnnee] = useState("2025-2026");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const a = await AsyncStorage.getItem("anneeScolaire");
        if (a) setAnnee(a);
      };
      load();
    }, []),
  );

  const {
    data: affectationsData,
    isLoading: isAffectationsLoading,
    isError: isAffectError,
    error,
  } = useQuery<any[]>({
    queryKey: ["affectations", id],
    queryFn: async () => {
      try {
        return await affectationService.getAffectations(id);
      } catch (error) {
        console.error("Erreur affectations :", error);
        return [];
      }
    },
  });

  // une affectation = une matière dans une classe : on dédoublonne les classes
  const classes: Classe[] = useMemo(() => {
    const map = new Map<number, Classe>();
    (affectationsData ?? []).forEach((item) => {
      if (!map.has(item.idC))
        map.set(item.idC, { id: item.idC, nom: item.name });
    });
    return Array.from(map.values());
  }, [affectationsData]);

  // matières du prof dans la classe choisie
  const matieresProf: string[] = useMemo(() => {
    if (!selectedClasse) return [];
    return (affectationsData ?? [])
      .filter((item) => item.idC === selectedClasse.id)
      .map((item) => item.matiere);
  }, [affectationsData, selectedClasse]);

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isRefetching,
    refetch,
    isError: isEleveError,
  } = useQuery<any[]>({
    queryKey: ["eleves", selectedClasse?.id, annee],
    enabled: !!selectedClasse,
    queryFn: async () => {
      try {
        return await studentService.getStudents(selectedClasse!.id, annee);
      } catch (error) {
        console.error("Erreur élèves :", error);
        return [];
      }
    },
  });

  const eleves: Eleve[] = useMemo(() => {
    const q = searchValue.toLowerCase();
    return (studentsData ?? [])
      .map((e) => ({ id: e.id, nom: e.nom, prenom: e.prenom }))
      .filter(
        (e) =>
          e.nom?.toLowerCase().includes(q) ||
          e.prenom?.toLowerCase().includes(q),
      );
  }, [studentsData, searchValue]);

  const handleClasse = (classe: Classe) => {
    setSelectedClasse(classe);
    setSearchValue("");
    setPickerOpen(false);
  };

  const openEleve = (eleve: Eleve) => {
    if (!selectedClasse) return;
    navigation.navigate("ResultatEleve", {
      resultatEleve: {
        idEleve: Number(eleve.id),
        nom: eleve.nom,
        prenom: eleve.prenom,
        idC: selectedClasse.id,
        annee,
        matieresProf,
      },
    });
  };

  const renderEleve = ({ item, index }: { item: Eleve; index: number }) => (
    <Pressable
      onPress={() => openEleve(item)}
      style={({ pressed }) => [styles.studentRow, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.studentNumber}>
        <Text style={styles.studentNumberText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.studentName}>{item.nom}</Text>
        <Text style={styles.studentFirstName}>{item.prenom}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textMuted} />
    </Pressable>
  );

  if (isAffectError || isEleveError) {
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
        title="Résultats"
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />
      <FlatList
        data={selectedClasse ? eleves : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderEleve}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.subtitle}>
              Choisissez une classe pour consulter les résultats.
            </Text>

            <Text style={styles.label}>Classe</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setPickerOpen((o) => !o)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedClasse && { color: COLORS.textMuted },
                ]}
              >
                {selectedClasse?.nom ?? "Choisir une classe"}
              </Text>
              <ChevronDown size={20} color={COLORS.textSecondary} />
            </Pressable>

            {pickerOpen && (
              <View style={styles.optionsList}>
                {isAffectationsLoading ? (
                  <ActivityIndicator
                    style={{ padding: SIZES.spaceMD }}
                    color={COLORS.primary}
                  />
                ) : (
                  classes.map((classe) => (
                    <Pressable
                      key={classe.id}
                      style={styles.option}
                      onPress={() => handleClasse(classe)}
                    >
                      <Text style={styles.optionText}>{classe.nom}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {selectedClasse && (
              <>
                <View
                  style={{ marginTop: SIZES.spaceMD, marginHorizontal: -15 }}
                >
                  <ThemedSearchBar
                    value={searchValue}
                    onChangeText={setSearchValue}
                  />
                </View>
                <Text style={styles.sectionTitle}>
                  Élèves ({eleves.length})
                </Text>
                <Text style={styles.helperText}>
                  Touchez un élève pour voir ses notes.
                </Text>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          isStudentsLoading && selectedClasse ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Users size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>
                {selectedClasse ? "Aucun élève" : "Choisissez une classe"}
              </Text>
              <Text style={styles.emptyText}>
                {selectedClasse
                  ? "Aucun élève trouvé."
                  : "Sélectionnez une classe pour continuer."}
              </Text>
            </View>
          )
        }
      />
    </ThemedView>
  );
};

export default ResultatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: {
    paddingHorizontal: SIZES.spaceLG,
    paddingBottom: SIZES.space2XL,
  },
  subtitle: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginTop: SIZES.spaceMD,
    marginBottom: SIZES.spaceLG,
  },
  label: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceSM,
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
  dropdownText: { fontSize: SIZES.textMD, color: COLORS.text },
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
  optionText: { fontSize: SIZES.textMD, color: COLORS.text },
  sectionTitle: {
    marginTop: SIZES.spaceLG,
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
  studentRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceMD,
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceSM,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  studentName: { fontSize: SIZES.textSM, fontWeight: 600, color: COLORS.text },
  studentFirstName: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  emptyState: { alignItems: "center", paddingVertical: SIZES.space2XL },
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
});
