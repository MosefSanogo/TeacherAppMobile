import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import affectationService from "@/services/affectation.service";
import evaluationService from "@/services/evaluation.service";
import otherService from "@/services/other.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  Hash,
  Save,
  X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";

type Option = {
  value: string;
  label: string;
};

const formatDisplay = (d: Date) =>
  d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // 15/08/2026

export default function EvaluationsScreen() {
  const [evalId, setEvalId] = useState<string>("");
  const [periode, setPeriode] = useState("");
  const [classe, setClasse] = useState("");
  const [matiere, setMatiere] = useState("");

  const [libelle, setLibelle] = useState("");
  const [noteSur, setNoteSur] = useState("20");
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [afficheBulletin, setAfficheBulletin] = useState(true);

  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const [loader, setLoader] = useState(false);
  const [annee, setAnnee] = useState("2025-2026");
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const { userInfo } = useAuth();
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const ecole = await AsyncStorage.getItem("anneeScolaire");
        setAnnee(ecole || "");
      };
      load();
    }, []),
  );
  // texte JJ/MM/AAAA utilisé par la validation, le résumé et l'envoi
  const date = dateValue ? formatDisplay(dateValue) : "";

  // bornes du calendrier = l'année scolaire (ex : 2025-2026)
  const [anneeDebut, anneeFin] = annee.split("-").map(Number);
  const minDate = anneeDebut ? new Date(anneeDebut, 0, 1) : undefined;
  const maxDate = anneeFin ? new Date(anneeFin, 11, 31) : undefined;

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // sur Android, le calendrier se ferme tout seul
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selected) return;

    setDateValue(selected);
    if (Platform.OS === "ios") setShowPicker(false);
  };
  // Charger périodes + affectations
  const id = Number(userInfo?.id);
  const {
    data: affectationsData,
    isLoading: isAffectationsLoading,
    isError: isAffectionError,
    error: errorAffection,
  } = useQuery<any[]>({
    queryKey: ["affectations", id],
    queryFn: async () => {
      try {
        const data: any[] = await affectationService.getAffectations(id);
        return data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des affectations :",
          error,
        );
        return [];
      }
    },
  });

  const {
    data: periodesData,
    isLoading: isPeriodesLoading,
    isError: isPeriodeError,
    error: errorPeriode,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["periodes"],
    queryFn: async () => {
      try {
        const data: any[] = await otherService.getPeriode();
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération des périodes :", error);
        return [];
      }
    },
  });
  const dataPeriodesFormated: Option[] = useMemo(() => {
    return (
      periodesData?.map((item) => ({
        value: item.lib,
        label: item.lib,
      })) || []
    );
  }, [periodesData]);

  const dataClassesFormated: Option[] = useMemo(() => {
    return (
      affectationsData?.map((item) => ({
        value: String(item.idC),
        label: item.name,
      })) || []
    );
  }, [affectationsData]);

  const dataMatieresFormated: Option[] = useMemo(() => {
    return (
      affectationsData?.map((item) => ({
        value: String(item.matiere),
        label: item.matiere,
      })) || []
    );
  }, [affectationsData]);

  const getLabel = (options: Option[], value: string) => {
    return options.find((item) => item.value === value)?.label;
  };

  const handleCreate = async () => {
    setLoader(true);
    if (!periode) {
      Alert.alert("Information", "Veuillez sélectionner une période.");
      setLoader(false);
      return;
    }

    if (!classe) {
      Alert.alert("Information", "Veuillez sélectionner une classe.");
      setLoader(false);
      return;
    }

    if (!matiere) {
      Alert.alert("Information", "Veuillez sélectionner une matière.");
      setLoader(false);
      return;
    }

    if (!libelle.trim()) {
      Alert.alert("Information", "Veuillez renseigner le libellé.");
      setLoader(false);
      return;
    }

    if (!noteSur.trim()) {
      Alert.alert("Information", "Veuillez renseigner la note sur.");
      setLoader(false);
      return;
    }

    if (!date.trim()) {
      Alert.alert("Information", "Veuillez renseigner la date.");
      setLoader(false);
      return;
    }
    const tabAn = annee.split("-");
    const year = date.split("/")[2];

    if (year !== tabAn[0] && year !== tabAn[1]) {
      Alert.alert(
        "Information",
        `L'année de l'évaluation doit correspondre à l'année scolaire en cours ${tabAn[0]} ou ${tabAn[1]}.`,
      );
      setLoader(false);
      return;
    }

    const evaluation = {
      periode,
      classe,
      matiere,
      titre: libelle.trim(),
      note: Number(noteSur),
      date,
      affiche: afficheBulletin,
      annee: annee,
    };

    try {
      const response = await evaluationService.register(evaluation);
      ToastAndroid.show(
        "L'évaluation a été créée avec succès.",
        ToastAndroid.SHORT,
      );
      setEvalId(String(response.id));
      setLoader(false);
      navigation.navigate("SaisieNote", {
        noteForm: {
          noteSur: Number(noteSur),
          matiere: matiere,
          annee: annee,
          classeId: Number(classe),
          evalId: String(response.id),
          type: "evaluation",
        },
      });
      setPeriode("");
      setClasse("");
      setMatiere("");
      setLibelle("");
    } catch (error) {
      setLoader(false);
      Alert.alert(
        "Erreur",
        "Impossible de créer l'évaluation. Veuillez réessayer.",
      );
    }
  };

  const renderSelect = (
    key: string,
    label: string,
    placeholder: string,
    value: string,
    options: Option[],
    icon: React.ReactNode,
    onChange: (value: string) => void,
  ) => {
    const isOpen = openSelect === key;

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>

        <Pressable
          style={styles.select}
          onPress={() => setOpenSelect(isOpen ? null : key)}
        >
          <View style={styles.selectLeft}>
            <View style={styles.iconContainer}>{icon}</View>

            <Text style={[styles.selectText, !value && styles.placeholder]}>
              {value ? getLabel(options, value) : placeholder}
            </Text>
          </View>

          <ChevronDown size={SIZES.iconMD} color={COLORS.textSecondary} />
        </Pressable>

        {isOpen && (
          <View style={styles.options}>
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onChange(option.value);
                    setOpenSelect(null);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected && <Check size={18} color={COLORS.primary} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (isAffectionError || isPeriodeError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork =
      errorAffection?.message === "NETWORK_ERROR" || !errorAffection;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={errorAffection?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ThemeHarder
        title={"Evaluations"}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Contexte scolaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contexte scolaire</Text>

          {renderSelect(
            "periode",
            "Période",
            "Sélectionner une période",
            periode,
            dataPeriodesFormated,
            <CalendarDays size={SIZES.iconMD} color={COLORS.primary} />,
            setPeriode,
          )}

          {renderSelect(
            "classe",
            "Classe",
            "Sélectionner une classe",
            classe,
            dataClassesFormated,
            <GraduationCap size={SIZES.iconMD} color={COLORS.primary} />,
            setClasse,
          )}

          {renderSelect(
            "matiere",
            "Matière",
            "Sélectionner une matière",
            matiere,
            dataMatieresFormated,
            <FileText size={SIZES.iconMD} color={COLORS.primary} />,
            setMatiere,
          )}
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l'évaluation</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Libellé</Text>

            <View style={styles.inputContainer}>
              <FileText size={SIZES.iconMD} color={COLORS.textSecondary} />

              <TextInput
                value={libelle}
                onChangeText={setLibelle}
                placeholder="Ex. Contrôle de mathématiques"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Note sur</Text>

              <View style={styles.inputContainer}>
                <Hash size={SIZES.iconMD} color={COLORS.textSecondary} />

                <TextInput
                  value={noteSur}
                  onChangeText={setNoteSur}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Date</Text>

              <Pressable
                style={styles.inputContainer}
                onPress={() => setShowPicker(true)}
              >
                <CalendarDays
                  size={SIZES.iconMD}
                  color={COLORS.textSecondary}
                />

                <Text style={[styles.dateText, !date && styles.placeholder]}>
                  {date || "JJ/MM/AAAA"}
                </Text>

                {date !== "" && (
                  <Pressable onPress={() => setDateValue(null)} hitSlop={10}>
                    <X size={SIZES.iconMD} color={COLORS.textSecondary} />
                  </Pressable>
                )}
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  value={dateValue ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>
        </View>

        {/* Bulletin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bulletin</Text>

          <View style={styles.bulletinCard}>
            <View style={styles.bulletinIcon}>
              <ClipboardList size={SIZES.iconMD} color={COLORS.primary} />
            </View>

            <View style={styles.bulletinContent}>
              <Text style={styles.bulletinTitle}>Afficher sur le bulletin</Text>

              <Text style={styles.bulletinDescription}>
                Cette évaluation sera prise en compte dans le bulletin de
                l'élève.
              </Text>
            </View>

            <Switch
              value={afficheBulletin}
              onValueChange={setAfficheBulletin}
              trackColor={{
                false: COLORS.border,
                true: COLORS.primaryLight,
              }}
              thumbColor={afficheBulletin ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Résumé */}
        {(periode || classe || matiere || libelle || date) && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Résumé</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Période</Text>
              <Text style={styles.summaryValue}>
                {getLabel(dataPeriodesFormated, periode) || "—"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Classe</Text>
              <Text style={styles.summaryValue}>
                {getLabel(dataClassesFormated, classe) || "—"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Matière</Text>
              <Text style={styles.summaryValue}>
                {getLabel(dataMatieresFormated, matiere) || "—"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Note</Text>
              <Text style={styles.summaryValue}>
                {noteSur ? `/${noteSur}` : "—"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{date}</Text>
            </View>
          </View>
        )}

        {/* Bouton */}
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
        >
          <Save size={SIZES.iconMD} color={COLORS.white} />

          <Text style={styles.createButtonText}>Créer l'évaluation</Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
      {loader && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: "relative",
  },

  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spaceLG,
    paddingVertical: SIZES.spaceLG,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMD,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceMD,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: SIZES.textXL,
    fontWeight: 600,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
  },

  content: {
    padding: SIZES.spaceLG,
  },

  section: {
    marginBottom: SIZES.spaceXL,
  },

  sectionTitle: {
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceMD,
  },

  field: {
    marginBottom: SIZES.spaceMD,
  },

  label: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: SIZES.spaceSM,
  },

  select: {
    minHeight: SIZES.inputHeight,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    paddingHorizontal: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceSM,
  },

  selectText: {
    flex: 1,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.textMuted,
  },

  options: {
    marginTop: SIZES.spaceXS,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    overflow: "hidden",
    ...SHADOWS.small,
  },

  option: {
    minHeight: 48,
    paddingHorizontal: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  optionSelected: {
    backgroundColor: COLORS.primaryLight,
  },

  optionText: {
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: 500,
  },

  inputContainer: {
    height: SIZES.inputHeight,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    paddingHorizontal: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: SIZES.spaceSM,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  row: {
    flexDirection: "row",
    gap: SIZES.spaceMD,
  },

  halfField: {
    flex: 1,
  },

  bulletinCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.small,
  },

  bulletinIcon: {
    width: 42,
    height: 42,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceMD,
  },

  bulletinContent: {
    flex: 1,
    marginRight: SIZES.spaceSM,
  },

  bulletinTitle: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.text,
  },

  bulletinDescription: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  summary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceLG,
  },

  summaryTitle: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.primary,
    marginBottom: SIZES.spaceSM,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.spaceXS,
  },

  summaryLabel: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },

  summaryValue: {
    maxWidth: "60%",
    fontSize: SIZES.textXS,
    fontWeight: 500,
    color: COLORS.text,
    textAlign: "right",
  },

  createButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  createButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  createButtonText: {
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.white,
  },

  bottomSpace: {
    height: SIZES.space2XL,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    backgroundColor: "#33333386",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    flex: 1,
    marginLeft: SIZES.spaceSM,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },
});
