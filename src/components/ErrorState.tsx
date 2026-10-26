import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export function ErrorState({
  message,
  onRetry,
  isNetworkError = false,
}: ErrorStateProps) {
  const defaultMessage = isNetworkError
    ? "Oups ! Impossible de se connecter à Internet. Vérifiez votre réseau et réessayez."
    : "Une erreur est survenue lors du chargement des données.";

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={
            isNetworkError ? "cloud-offline-outline" : "alert-circle-outline"
          }
          size={64}
          color="#EF4444"
        />
      </View>

      <Text style={styles.title}>
        {isNetworkError ? "Hors ligne" : "Erreur de chargement"}
      </Text>

      <Text style={styles.message}>{defaultMessage}</Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: "#FEE2E2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
