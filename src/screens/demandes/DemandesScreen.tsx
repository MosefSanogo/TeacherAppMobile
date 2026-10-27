import DemandeCard from "@/components/demandeCard";
import { ErrorState } from "@/components/ErrorState";
import HomeHeader from "@/components/homeHeader";
import ThemeButton from "@/components/theme-button";
import ThemeEmptyData from "@/components/theme-empty-data";
import ThemedSearchBar from "@/components/theme-search-box";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { DemandeStackNavigationProp } from "@/navigation/stacks/DemandesStack";
import demandeService from "@/services/demande.service";
import { DemandeType } from "@/types/demande";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
const formated: Record<string, string> = {
  absence: "Demande d'absence",
  document: "Demande de document",
  administrative: "Demande administrative",
  other: "Autre demande",
};

const cat: { id: number; label: string; status: string }[] = [
  { id: 1, label: "Toutes", status: "all" },
  { id: 2, label: "En attente", status: "pending" },
  { id: 3, label: "Traitées", status: "approved" },
];

const DemandesScreen = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [catValue, setCatValue] = useState("Toutes");
  const navigate = useNavigation<DemandeStackNavigationProp>();
  const { userInfo } = useAuth();

  const {
    data: demandesData,
    isLoading: isDemandesLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["demandes", Number(userInfo?.id)],
    queryFn: async () => {
      try {
        const data: DemandeType[] = await demandeService.getProfDemandes(
          Number(userInfo?.id),
        );
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const dataFormated = useMemo(() => {
    if (!demandesData) return [];
    const status = cat.find((item) => item.label === catValue)?.status;

    return demandesData
      .filter(
        (demande) =>
          catValue === "Toutes" ||
          demande.status.toLowerCase() === status?.toLowerCase(),
      )
      .map((item) => ({
        id: item.id,
        title: formated[item.type] || "Demande",
        description: item.description,
        date: item.date,
        status: item.status,
        type: item.type,
      }));
  }, [demandesData, catValue]);

  const dataFiltered = useMemo(() => {
    return dataFormated.filter((demande) =>
      demande?.title?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [dataFormated, searchValue]);

  const handleCat = (label: string) => {
    setCatValue(label);
  };

  if (isError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork = error.message === "NETWORK_ERROR";

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
        data={dataFiltered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DemandeCard {...item} onPress={() => {}} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <View>
            <HomeHeader
              title="Demandes"
              subtitle="Gérez vos demandes administratives"
            />
            <ThemedSearchBar
              value={searchValue}
              onChangeText={setSearchValue}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingHorizontal: 15,
                  marginTop: 8,
                }}
              >
                {cat.map((item) => (
                  <ThemeButton
                    key={item.id}
                    name={item.label}
                    onPress={() => handleCat(item.label)}
                    style={[
                      {
                        backgroundColor: "transparent",
                        padding: 8,
                      },
                      item.label === catValue && {
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                    textStyle={[
                      {
                        color: COLORS.text,
                        marginLeft: 0,
                        fontSize: SIZES.textSM,
                      },
                      item.label === catValue && { color: COLORS.white },
                    ]}
                  />
                ))}
              </View>
            </ScrollView>
            <ThemedText
              style={{ fontSize: 16, fontWeight: "bold", margin: 15 }}
            >
              Mes demandes
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          isDemandesLoading ? (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <ThemedText style={{ textAlign: "center", marginTop: 10 }}>
                Chargement des demandes...
              </ThemedText>
            </View>
          ) : catValue === "Toutes" ? (
            <ThemeEmptyData
              icon="file-tray-outline"
              titre="Aucune demande"
              message="Vous n'avez pas encore fait de demande."
            />
          ) : (
            <ThemeEmptyData
              icon="file-tray-outline"
              titre={`Aucune demande ${catValue.toLowerCase()}`}
              message={`Vous n'avez pas de demande ${catValue.toLowerCase()}.`}
            />
          )
        }
        ListFooterComponent={
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <ThemeButton
              name="Nouvelle demande"
              onPress={() => {
                navigate.navigate("NouvelleDemande");
              }}
              iconName="add-outline"
              style={{ width: "65%", backgroundColor: COLORS.primary }}
            />
          </View>
        }
      />
    </ThemedView>
  );
};

export default DemandesScreen;

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
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
});
