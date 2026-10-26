import { ErrorState } from "@/components/ErrorState";
import HomeHeader from "@/components/homeHeader";
import QuickActionCard from "@/components/quickActionCard";
import ThemeEmptyData from "@/components/theme-empty-data";
import ThemedScrollView from "@/components/themed-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import affectationService from "@/services/affectation.service";
import { schoolActions } from "@/testData/mock_scolarite";
import { QuickActionCardProps } from "@/types/quickActionCardProps";
import { useNavigation } from "@react-navigation/core";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const ScolariteScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const { userInfo } = useAuth();
  // Charger périodes + affectations
  const id = Number(userInfo?.id);
  const {
    data: affectationsData,
    isLoading: isAffectationsLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["affectations", id],
    queryFn: () => {
      try {
        const data = affectationService.getAffectations(id);
        return data;
      } catch (error) {
        return [];
      }
    },
  });
  const affectationsFormated: QuickActionCardProps[] = useMemo(() => {
    if (!affectationsData) return [];
    return affectationsData.map((affectation: any) => ({
      id: affectation.idC,
      title: affectation.name,
      subtitle: affectation.matiere,
      icon: Users,
      color: COLORS.warning,
      navigation: "Classes",
    }));
  }, [affectationsData]);

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
      <ThemedScrollView>
        <HomeHeader
          title="Scolarité"
          subtitle="Gérez les notes et les présences"
        />
        <ThemedText
          type="subtitle"
          style={{ marginLeft: 15, marginBottom: 10, fontSize: 18 }}
        >
          Catégorie principale
        </ThemedText>
        <View>
          {schoolActions.map((item, i) => {
            return (
              <QuickActionCard
                key={i}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                color={item.color}
                onPress={() => navigation.navigate(item.navigation as never)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 15,
                  minHeight: "auto",
                  padding: 8,
                  borderRadius: 8,
                  marginHorizontal: 15,
                  elevation: 0,
                }}
              />
            );
          })}
        </View>
        <ThemedText
          type="subtitle"
          style={{ marginLeft: 15, marginVertical: 10, fontSize: 18 }}
        >
          Mes classes
        </ThemedText>
        <View>
          {affectationsFormated.length > 0 &&
            affectationsFormated.map((item, i) => {
              return (
                <QuickActionCard
                  key={i}
                  title={`${item.title} annnée`}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  color={COLORS.warning}
                  onPress={() => {
                    navigation.navigate("Classes", {
                      classe: {
                        id: affectationsFormated[i].id,
                        lib: item.title + " " + item.subtitle,
                      },
                    });
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 15,
                    minHeight: "auto",
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    marginHorizontal: 15,
                    elevation: 0,
                  }}
                />
              );
            })}
          {isAffectationsLoading && (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 20 }}
            />
          )}
          {!isAffectationsLoading && affectationsFormated.length === 0 && (
            <ThemeEmptyData
              icon="file-tray-outline"
              titre="Aucune classe"
              message="Vous n'avez pas encore de classe affectée."
            />
          )}
        </View>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default ScolariteScreen;
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
});
