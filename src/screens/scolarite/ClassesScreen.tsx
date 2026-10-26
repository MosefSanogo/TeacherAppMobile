import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  ClasseType,
  ScolariteStackNavigationProp,
} from "@/navigation/stacks/ScolariteStack";
import studentService from "@/services/student.service";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
};

const ClasseScreen = () => {
  const [recherche, setRecherche] = useState("");
  const [annee, setAnnee] = useState("2025-2026");
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const { userInfo } = useAuth();
  const route = useRoute(); // Récupère les paramètres de navigation
  const { classe } = route.params as { classe: ClasseType }; // Déstructure le paramètre "classe" de type ClasseType
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const ecole = await AsyncStorage.getItem("anneeScolaire");
        setAnnee(ecole || "");
      };
      load();
    }, []),
  );
  const {
    data: students = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eleves", classe.id, annee],
    queryFn: async () => {
      try {
        const data = await studentService.getStudents(classe.id, annee);
        return data;
      } catch (error) {
        return [];
      }
    },
  });
  // À remplacer par les données récupérées depuis ton API.
  const eleves = useMemo(() => {
    if (loading) {
      return [];
    }
    return students.map((eleve) => ({
      id: eleve.id,
      nom: eleve.nom,
      prenom: eleve.prenom,
      matricule: eleve.matricule,
    }));
  }, [students, loading]);

  const elevesFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) return eleves;

    return eleves.filter((eleve) =>
      `${eleve.prenom} ${eleve.nom} ${eleve.matricule}`
        .toLowerCase()
        .includes(terme),
    );
  }, [recherche, eleves]);

  const renderEleve = ({ item, index }: { item: Eleve; index: number }) => (
    <TouchableOpacity
      style={styles.eleveCard}
      activeOpacity={0.75}
      onPress={() => {
        navigation.navigate("StudentProfil", {
          studentProfil: {
            idEleve: item.id,
            mat: classe.lib.split(" ")[1],
            idC: classe.id,
            annee: annee,
          },
        });
      }}
    >
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>
          {item.prenom.charAt(0)}
          {item.nom.charAt(0)}
        </ThemedText>
      </View>

      <View style={styles.eleveInfos}>
        <ThemedText style={styles.eleveNom}>
          {item.prenom} {item.nom}
        </ThemedText>
        <ThemedText style={styles.matricule}>
          Matricule : {item.matricule}
        </ThemedText>
      </View>

      <View style={styles.numero}>
        <ThemedText style={styles.numeroText}>
          {String(index + 1).padStart(2, "0")}
        </ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  if (isError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork = error.message === "NETWORK_ERROR" || !error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemeHarder
        title="Classe"
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />
      <FlatList
        data={elevesFiltres}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderEleve}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Sélecteur de classe */}
            <View style={styles.classeCard}>
              <View style={styles.classeIcon}>
                <Ionicons
                  name="school-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.classeInfos}>
                <ThemedText style={styles.classeLabel}>
                  CLASSE SÉLECTIONNÉE
                </ThemedText>
                <ThemedText style={styles.classeNom}>
                  {classe.lib.split(" ")[1]}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={styles.changeClasse}
                onPress={() => {
                  // Ouvrir ici le sélecteur des classes affectées au professeur.
                }}
              >
                <Ionicons name="chevron-down" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Statistiques */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons
                    name="people-outline"
                    size={21}
                    color={COLORS.primary}
                  />
                </View>
                <ThemedText style={styles.statValue}>
                  {eleves.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Élèves inscrits
                </ThemedText>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.statIconGreen]}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#16845B"
                  />
                </View>
                <ThemedText style={styles.statValue}>
                  {elevesFiltres.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Résultats affichés
                </ThemedText>
              </View>
            </View>

            {/* Recherche */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={21}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Nom, prénom ou matricule..."
                placeholderTextColor={COLORS.textSecondary}
                value={recherche}
                onChangeText={setRecherche}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {recherche.length > 0 && (
                <TouchableOpacity onPress={() => setRecherche("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Titre de liste */}
            <View style={styles.listHeader}>
              <ThemedText style={styles.listTitle}>Liste des élèves</ThemedText>
              <ThemedText style={styles.listCount}>
                {elevesFiltres.length} élève(s)
              </ThemedText>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={38}
              color={COLORS.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              Aucun élève trouvé
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Essayez un autre nom ou matricule.
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
};

export default ClasseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  surTitre: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: COLORS.primary,
    marginBottom: 7,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  classeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },
  classeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  classeInfos: {
    flex: 1,
    marginLeft: 13,
  },
  classeLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.white,
    opacity: 0.8,
  },
  classeNom: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.white,
    marginTop: 4,
  },
  changeClasse: {
    padding: 7,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statIconGreen: {
    backgroundColor: "#E5F6EE",
  },
  statValue: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 51,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 23,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  listCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eleveCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  eleveInfos: {
    flex: 1,
    marginLeft: 12,
  },
  eleveNom: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  matricule: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  numero: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  numeroText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
});
