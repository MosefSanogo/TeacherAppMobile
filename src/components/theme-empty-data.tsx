import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { ThemedText } from "./themed-text";

const ThemeEmptyData = ({
  titre = "Aucun rendez-vous",
  message = "Votre agenda est vide pour le moment",
  icon = "calendar-outline",
  style,
}: {
  titre?: string;
  message?: string;
  icon?: string;
  style?: object;
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        },
        style,
      ]}
    >
      <Ionicons name={icon as any} size={80} color="#ddd" />
      <ThemedText style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
        {titre}
      </ThemedText>
      <ThemedText style={{ textAlign: "center", opacity: 0.5, marginTop: 5 }}>
        {message}
      </ThemedText>
    </View>
  );
};

export default ThemeEmptyData;
