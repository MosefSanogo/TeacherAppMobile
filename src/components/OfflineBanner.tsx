import { useNetInfo } from "@react-native-community/netinfo";
import { StyleSheet, Text, View } from "react-native";

export const OfflineBanner = () => {
  const netInfo = useNetInfo();

  if (netInfo.isConnected === false) {
    return (
      <View style={styles.banner}>
        <Text style={styles.text}>⚠️ Connexion Internet perdue</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#D9534F",
    padding: 8,
    alignItems: "center",
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
