import CoursCard from "@/components/coursCard";
import { ErrorState } from "@/components/ErrorState";
import HomeHeader from "@/components/homeHeader";
import ThemeButton from "@/components/theme-button";
import ThemeEmptyData from "@/components/theme-empty-data";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import emploiService from "@/services/emploi.service";
import { days } from "@/testData/mock_days";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const PlanningScreen = () => {
  const [day, setDay] = useState(2);
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
    isRefetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["plannings", userInfo?.id, annee],
    queryFn: async () => {
      try {
        return await emploiService.getEmploi(Number(userInfo?.id), annee);
      } catch (error) {
        return [];
      }
    },
  });

  const randomColor = useMemo(
    () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,
    [],
  );

  const handleDay = (id: number) => {
    setDay(id);
  };

  const coursDuJour = useMemo(
    () => planningData.filter((item: any) => item.jour === day),
    [planningData, day],
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
    <ThemedView style={style.container}>
      <ThemedText style={style.title}></ThemedText>
      <FlatList
        data={coursDuJour}
        keyExtractor={(item: any, index) => String(item.id ?? index)}
        renderItem={({ item }: { item: any }) => (
          <CoursCard
            matiere={item.matiere}
            classe={item.nom_classe}
            heureDebut={item.heure_debut}
            heureFin={item.heure_fin}
            couleur={randomColor}
            onPress={() => {}}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.listContent}
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
          <View style={{ marginHorizontal: -15 }}>
            <HomeHeader
              title="Planning"
              subtitle={`Emploi du temps ${annee}`}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingHorizontal: 8,
                  marginTop: 8,
                }}
              >
                {days.map((item) => (
                  <ThemeButton
                    key={item.id}
                    name={item.day}
                    onPress={() => handleDay(item.id)}
                    style={[
                      {
                        backgroundColor: "transparent",
                        paddingHorizontal: 12,
                      },
                      item.id === day && { backgroundColor: COLORS.primary },
                    ]}
                    textStyle={[
                      {
                        color: COLORS.text,
                        marginLeft: 0,
                        fontSize: SIZES.textSM,
                      },
                      item.id === day && { color: COLORS.white },
                    ]}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={{ height: 20 }} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <ThemedText style={{ textAlign: "center", marginTop: 10 }}>
                Chargement du planning...
              </ThemedText>
            </View>
          ) : (
            <ThemeEmptyData
              titre="Aucun cours"
              message="Aucun cours trouvé pour ce jour"
            />
          )
        }
      />
    </ThemedView>
  );
};

export default PlanningScreen;

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -32,
    backgroundColor: "#3333",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
});
