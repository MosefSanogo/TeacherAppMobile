import { COLORS } from "@/constants/theme";
import DemandesScreen from "@/screens/demandes/DemandesScreen";
import HomeScreen from "@/screens/home/HomeScreen";
import PlanningScreen from "@/screens/planning/PlanningScreen";
import ProfilScreen from "@/screens/profil/ProfilScreen";
import ScolariteScreen from "@/screens/scolarite/ScolariteScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const Tab = createBottomTabNavigator();
const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.background,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: insets.bottom ? 75 + insets.bottom : 80,
          paddingTop: 20,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          display: "none",
        },
        tabBarHideOnKeyboard: true,
      }}
      id="MainTabs"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: focused ? COLORS.primaryLight : COLORS.white,
                },
              ]}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.text}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Planning"
        component={PlanningScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: focused ? COLORS.primaryLight : COLORS.white,
                },
              ]}
            >
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.text}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Scolarite"
        component={ScolariteScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: focused ? COLORS.primaryLight : COLORS.white,
                },
              ]}
            >
              <Ionicons
                name={focused ? "school" : "school-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.text}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Demandes"
        component={DemandesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: focused ? COLORS.primaryLight : COLORS.white,
                },
              ]}
            >
              <Ionicons
                name={focused ? "document" : "document-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.text}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: focused ? COLORS.primaryLight : "#fff",
                },
              ]}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.text}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 45,
  },
});
