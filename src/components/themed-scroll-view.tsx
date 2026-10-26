import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const ThemedScrollView = ({
  children,
  padding,
}: {
  children: React.ReactNode;
  padding?: number;
}) => {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 20,
        paddingHorizontal: 0,
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

export default ThemedScrollView;

const styles = StyleSheet.create({});
