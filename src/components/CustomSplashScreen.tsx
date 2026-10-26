import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  onFinish: () => void;
};

export default function CustomSplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container]}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/icone.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Eduq</Text>

        <Text style={styles.slogan}>L'éducation connectée, simplement.</Text>
      </View>

      <Text style={styles.footer}>Apprendre • Enseigner • Réussir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
    backgroundColor: "#F4F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 145,
    height: 145,
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#173B75",
    letterSpacing: 1,
  },
  slogan: {
    marginTop: 10,
    paddingHorizontal: 25,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 45,
    fontSize: 12,
    color: "#64748B",
    letterSpacing: 0.5,
  },
});
