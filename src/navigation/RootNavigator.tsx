import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

// Import du hook d'authentification
import { useAuth } from "@/context/AuthContext"; // Ajustez le chemin vers votre AuthContext

// Screens
import LoginScreen from "@/screens/auth/LoginScreen";
import DemandesScreen from "@/screens/demandes/DemandesScreen";
import NouvelleDemandeScreen from "@/screens/demandes/NouvelleDemandeScreen";
import HistoriquePaieScreen from "@/screens/profil/HistoriquePaieScreen";
import ClassesScreen from "@/screens/scolarite/ClassesScreen";
import CompositionsScreen from "@/screens/scolarite/CompositionsScreen";
import EvaluationsScreen from "@/screens/scolarite/EvaluationsScreen";
import PresencesScreen from "@/screens/scolarite/PresencesScreen";
import ResultatEleveScreen from "@/screens/scolarite/ResultatEleveScreen";
import ResultatScreen from "@/screens/scolarite/ResultatScreen";
import SaisieNotesScreen from "@/screens/scolarite/SaisieNotesScreen";
import StudentProfilScreen from "@/screens/scolarite/StudentProfilScreen";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function RootStackNavigator() {
  const { userToken, isLoading } = useAuth();

  // Écran d'attente le temps de vérifier la présence du token dans AsyncStorage
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken === null ? (
        // Écran public (Non connecté)
        <Stack.Screen name="login" component={LoginScreen} />
      ) : (
        // Écrans protégés (Connecté uniquement)
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Demandes" component={DemandesScreen} />
          <Stack.Screen
            name="NouvelleDemande"
            component={NouvelleDemandeScreen}
          />
          <Stack.Screen name="Evaluations" component={EvaluationsScreen} />
          <Stack.Screen name="Compositions" component={CompositionsScreen} />
          <Stack.Screen name="Presences" component={PresencesScreen} />
          <Stack.Screen name="Resultats" component={ResultatScreen} />
          <Stack.Screen name="SaisieNote" component={SaisieNotesScreen} />
          <Stack.Screen name="Classes" component={ClassesScreen} />
          <Stack.Screen
            name="HistoriquePaie"
            component={HistoriquePaieScreen}
          />
          <Stack.Screen name="StudentProfil" component={StudentProfilScreen} />
          <Stack.Screen name="ResultatEleve" component={ResultatEleveScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
