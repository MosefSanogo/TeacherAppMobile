import CoursCard from "@/components/coursCard";
import { ErrorState } from "@/components/ErrorState";
import HomeHeader from "@/components/homeHeader";
import QuickActionCard from "@/components/quickActionCard";
import ThemedScrollView from "@/components/themed-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import emploiService from "@/services/emploi.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import {
  BarChart3,
  CalendarMinus,
  ClipboardList,
  FileText,
  Users,
  WalletMinimal,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
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
  const {
    data: planningData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["planningToday", userInfo?.id, annee],
    queryFn: async () => {
      try {
        return await emploiService.getTodayEmploi(Number(userInfo?.id), annee);
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  });
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
  const randomColor = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
  return (
    <ThemedView style={style.container}>
      <ThemedText style={style.title}></ThemedText>
      <ThemedScrollView>
        <HomeHeader title="Eduq Enseignant" subtitle="Espace enseignant" />
        <View style={style.planning}>
          <ThemedText style={{ color: COLORS.primary }}>
            Bonjour, {userInfo?.prenom} {userInfo?.nom}
          </ThemedText>
          <ThemedText type="subtitle">Bonjour 👋</ThemedText>
          <ThemedText
            style={{ fontSize: SIZES.textXS, color: COLORS.textSecondary }}
          >
            Voici votre journée et vos prochaines tâches.
          </ThemedText>
          <View style={{ flexDirection: "row", gap: 5, marginTop: 8 }}>
            <Ionicons size={22} name="calendar" color={COLORS.primary} />
            <ThemedText>Planning du jour</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            {planningData.length > 0 &&
              planningData.map((item: any, i: any) => {
                return (
                  <CoursCard
                    key={i}
                    matiere={item.matiere}
                    classe={item.nom_classe}
                    heureDebut={item.heure_debut}
                    heureFin={item.heure_fin}
                    couleur={randomColor}
                    onPress={() => {}}
                  />
                );
              })}
            {isLoading && (
              <ActivityIndicator size="large" color={COLORS.primary} />
            )}
            {planningData.length === 0 && !isLoading && (
              <ThemedText>Aucun planning trouvé</ThemedText>
            )}
          </View>
        </View>
        <ThemedText
          type="subtitle"
          style={{ marginHorizontal: 15, marginTop: 15 }}
        >
          Accès rapide
        </ThemedText>
        <View style={style.actionsGrid}>
          <View style={style.actionsGridView}>
            <QuickActionCard
              title="Évaluations"
              subtitle="Saisir les notes"
              icon={ClipboardList}
              color={COLORS.primary}
              onPress={() => navigation.navigate("Evaluations")}
            />

            <QuickActionCard
              title="Compositions"
              subtitle="Gérer les compositions"
              icon={FileText}
              color={COLORS.secondary}
              onPress={() => navigation.navigate("Compositions")}
            />
          </View>
          <View style={style.actionsGridView}>
            <QuickActionCard
              title="Présences"
              subtitle="Faire l'appel"
              icon={Users}
              color={COLORS.info}
              onPress={() => navigation.navigate("Presences")}
            />

            <QuickActionCard
              title="Résultats"
              subtitle="Consulter les résultats"
              icon={BarChart3}
              color={COLORS.success}
              onPress={() => navigation.navigate("Resultats")}
            />
          </View>
          <View style={style.actionsGridView}>
            <QuickActionCard
              title="Demande"
              subtitle="Faire une demande"
              icon={CalendarMinus}
              color={COLORS.warning}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Demandes" })
              }
            />

            <QuickActionCard
              title="Historique"
              subtitle="Accéder à l'historique de paie"
              icon={WalletMinimal}
              color={COLORS.danger}
              onPress={() => navigation.navigate("HistoriquePaie")}
            />
          </View>
        </View>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default HomeScreen;
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -32,
    backgroundColor: "#3333",
  },
  planning: {
    flexDirection: "column",
    gap: 5,
    padding: 15,
    backgroundColor: `${COLORS.primary}18`,
    borderRadius: SIZES.radiusLG,
    marginHorizontal: 15,
  },
  actionsGrid: {
    gap: 8,
    padding: 15,
    marginHorizontal: -SIZES.spaceXS,
  },
  actionsGridView: {
    flexDirection: "row",
    gap: 8,
  },
});
