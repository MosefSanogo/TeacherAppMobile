import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  School,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/auth.service";
const ANNEE_REGEX = /^\d{4}-\d{4}$/;

// "20252026" -> "2025-2026"
const formatAnnee = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

// vérifie le format ET que la 2e année = 1re année + 1
const isAnneeValide = (value: string) => {
  if (!ANNEE_REGEX.test(value)) return false;
  const [debut, fin] = value.split("-").map(Number);
  return fin === debut + 1;
};

type Errors = {
  ecole?: string;
  anneeScolaire?: string;
  username?: String;
  password?: string;
};

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [ecole, setEcole] = useState("");
  const [anneeScolaire, setAnneeScolaire] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const loginMutation = useMutation({
    mutationFn: () =>
      authService.login({
        ecole: ecole.trim(),
        username,
        password,
      }),
    onSuccess: async (data: any) => {
      await AsyncStorage.setItem("ecole", ecole);
      await AsyncStorage.setItem("anneeScolaire", anneeScolaire);
      if (data.user) {
        await login(data.token, data.user);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 422) {
          setServerError("École, année scolaire ou mot de passe incorrect.");
        } else if (!error.response) {
          setServerError("Impossible de joindre le serveur.");
        } else {
          setServerError(
            error.response?.data?.message ?? "Une erreur est survenue.",
          );
        }
      } else {
        setServerError("Une erreur est survenue.");
      }
    },
  });

  const validate = () => {
    const newErrors: Errors = {};

    if (!ecole.trim()) {
      newErrors.ecole = "Le nom de l'école est obligatoire.";
    }

    if (!anneeScolaire) {
      newErrors.anneeScolaire = "L'année scolaire est obligatoire.";
    } else if (!ANNEE_REGEX.test(anneeScolaire)) {
      newErrors.anneeScolaire = "Format attendu : aaaa-aaaa (ex : 2025-2026).";
    } else if (!isAnneeValide(anneeScolaire)) {
      newErrors.anneeScolaire =
        "La 2e année doit suivre la 1re (ex : 2025-2026).";
    }
    if (!username) {
      newErrors.username = "Le nom d'utilisateur est obligatoire";
    }
    if (!password) {
      newErrors.password = "Le mot de passe est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    setServerError("");
    if (!validate()) return;
    loginMutation.mutate();
  };

  const isLoading = loginMutation.isPending;
  if (loginMutation.isError) {
    const isNetwork =
      loginMutation.error.message === "NETWORK_ERROR" || !loginMutation.error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={loginMutation.error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <GraduationCap size={36} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Connectez-vous à votre espace professeur.
            </Text>
          </View>

          {serverError !== "" && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          {/* École */}
          <Text style={styles.label}>Nom de l'école</Text>
          <View
            style={[styles.inputWrapper, errors.ecole && styles.inputError]}
          >
            <School size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Ex : Lycée Moderne"
              placeholderTextColor={COLORS.textMuted}
              value={ecole}
              onChangeText={(text) => {
                setEcole(text);
                setErrors((e) => ({ ...e, ecole: undefined }));
              }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {errors.ecole && <Text style={styles.errorText}>{errors.ecole}</Text>}

          {/* Année scolaire */}
          <Text style={styles.label}>Année scolaire</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.anneeScolaire && styles.inputError,
            ]}
          >
            <CalendarDays size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="2025-2026"
              placeholderTextColor={COLORS.textMuted}
              value={anneeScolaire}
              onChangeText={(text) => {
                setAnneeScolaire(formatAnnee(text));
                setErrors((e) => ({ ...e, anneeScolaire: undefined }));
              }}
              keyboardType="number-pad"
              maxLength={9}
              returnKeyType="next"
            />
          </View>
          {errors.anneeScolaire && (
            <Text style={styles.errorText}>{errors.anneeScolaire}</Text>
          )}

          {/* Username */}
          <Text style={styles.label}>Nom de l'utilisateur</Text>
          <View
            style={[styles.inputWrapper, errors.username && styles.inputError]}
          >
            <User size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="votre nom d'utilisateur"
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((e) => ({ ...e, username: undefined }));
              }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {errors.anneeScolaire && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}

          {/* Mot de passe */}
          <Text style={styles.label}>Mot de passe</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputError]}
          >
            <Lock size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff size={20} color={COLORS.textSecondary} />
              ) : (
                <Eye size={20} color={COLORS.textSecondary} />
              )}
            </Pressable>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Bouton */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              isLoading && styles.loginButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <LogIn size={SIZES.iconMD} color={COLORS.white} />
            )}
            <Text style={styles.loginButtonText}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SIZES.spaceLG,
    paddingVertical: SIZES.space2XL,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZES.spaceXL,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.spaceMD,
    ...SHADOWS.small,
  },
  title: {
    fontSize: SIZES.textXL,
    fontWeight: 700,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  label: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceSM,
    marginTop: SIZES.spaceMD,
  },
  inputWrapper: {
    minHeight: SIZES.inputHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceSM,
    paddingHorizontal: SIZES.spaceLG,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: SIZES.textMD,
    color: COLORS.text,
    paddingVertical: SIZES.spaceSM,
  },
  errorText: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    color: COLORS.danger,
  },
  errorBanner: {
    padding: SIZES.spaceMD,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.surface,
  },
  errorBannerText: {
    fontSize: SIZES.textSM,
    color: COLORS.danger,
    textAlign: "center",
  },
  loginButton: {
    height: SIZES.buttonHeight,
    marginTop: SIZES.spaceXL,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },
  loginButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.white,
  },
});
