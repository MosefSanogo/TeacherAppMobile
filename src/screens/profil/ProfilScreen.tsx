import HomeHeader from "@/components/homeHeader";
import PersonalInfoSection from "@/components/personnalInfoSection";
import ProfileCard from "@/components/profileCard";
import ThemeButton from "@/components/theme-button";
import ThemedScrollView from "@/components/themed-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet } from "react-native";

const ProfilScreen = () => {
  const { userInfo, logout } = useAuth();
  const [ecole, setEcole] = useState("");
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const ecole = await AsyncStorage.getItem("ecole");
        setEcole(ecole || "");
      };
      load();
    }, []),
  );
  const log = () => {
    Alert.alert("Confirmation", "Êtes-vous sûr de vouloir vous déconnecter", [
      {
        text: "Annuler",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Oui, Je confirme",
        onPress: async () => {
          logout();
        },
        style: "destructive",
      },
    ]);
  };
  return (
    <ThemedView style={style.container}>
      <ThemedText style={style.title}></ThemedText>
      <ThemedScrollView>
        <HomeHeader title="Profile" subtitle="Mon compte personnel" />
        <ProfileCard
          name={`${userInfo?.prenom} ${userInfo?.nom}`}
          role={userInfo?.role}
          matiere={userInfo?.sexe}
          email={userInfo?.email}
          style={{ marginHorizontal: 12 }}
        />
        <PersonalInfoSection
          name={`${userInfo?.prenom} ${userInfo?.nom}`}
          email={userInfo?.email || ""}
          phone={userInfo?.tel}
          ecole={ecole}
          style={{ marginHorizontal: 12 }}
        />
        <ThemeButton
          name="Se deconnecter"
          onPress={log}
          iconColor={COLORS.white}
          iconName="log-out-outline"
          textStyle={{ color: COLORS.white, fontWeight: "bold" }}
          style={{
            marginHorizontal: "25%",
            marginTop: 15,
            backgroundColor: COLORS.danger,
            borderColor: COLORS.danger,
          }}
        />
      </ThemedScrollView>
    </ThemedView>
  );
};

export default ProfilScreen;
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
