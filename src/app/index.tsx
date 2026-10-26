import RootStackNavigator from "@/navigation/RootNavigator";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CustomSplashScreen from "@/components/CustomSplashScreen";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthProvider } from "@/context/AuthContext";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <OfflineBanner />

            <NavigationContainer>
              <RootStackNavigator />
            </NavigationContainer>

            {showCustomSplash && (
              <CustomSplashScreen onFinish={() => setShowCustomSplash(false)} />
            )}
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
