import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Paperclip,
  Send,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ThemeHarder from "@/components/theme-hearder";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { DemandeStackNavigationProp } from "@/navigation/stacks/DemandesStack";
import demandeService from "@/services/demande.service";

type DemandeType = "absence" | "document" | "administrative" | "other";

const TYPES: {
  value: DemandeType;
  label: string;
}[] = [
  { value: "absence", label: "Demande d'absence" },
  { value: "document", label: "Demande de document" },
  { value: "administrative", label: "Demande administrative" },
  { value: "other", label: "Autre demande" },
];

// aujourd'hui à 00:00 (pour comparer uniquement les jours)
const getToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

// 15/08/2026
const formatDisplay = (d: Date) =>
  d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function NouvelleDemandeScreen() {
  const navigation = useNavigation<DemandeStackNavigationProp>();
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();

  const [type, setType] = useState<DemandeType | null>(null);
  const [motif, setMotif] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );

  const selectedType = TYPES.find((item) => item.value === type);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("type", type!);
      formData.append("motif", motif.trim());
      formData.append("idP", String(userInfo?.id));

      if (date) {
        formData.append("date", formatDisplay(date)); // "15/08/2026"
      }

      if (file) {
        formData.append("pdf", {
          uri: file.uri,
          name: file.name || "document.pdf",
          type: file.mimeType || "application/pdf",
        } as any);
      }

      // pas de try/catch : l'erreur remonte à onError
      await demandeService.register(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demandes", Number(userInfo?.id)],
      });
      Alert.alert(
        "Demande envoyée",
        "Votre demande a été envoyée avec succès.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    },
    onError: () => {
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi.");
    },
  });

  const handleSubmit = () => {
    if (!type) {
      Alert.alert("Information", "Veuillez sélectionner un type de demande.");
      return;
    }
    if (!motif.trim()) {
      Alert.alert("Information", "Veuillez renseigner le motif.");
      return;
    }
    if (date && date < getToday()) {
      Alert.alert(
        "Date invalide",
        "La date doit être supérieure ou égale à aujourd'hui.",
      );
      return;
    }
    mutation.mutate();
  };

  const handleAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // sur Android, le calendrier se ferme tout seul
    if (Platform.OS === "android") setShowPicker(false);

    if (event.type === "dismissed" || !selected) return;

    const chosen = new Date(selected);
    chosen.setHours(0, 0, 0, 0);

    if (chosen < getToday()) {
      Alert.alert(
        "Date invalide",
        "La date de la demande doit être supérieure ou égale à aujourd'hui.",
      );
      return;
    }

    setDate(chosen);
    if (Platform.OS === "ios") setShowPicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <ThemeHarder
        title={"Nouvelle Demande"}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nouvelle demande</Text>
          <Text style={styles.headerSubtitle}>
            Remplissez les informations ci-dessous
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Type de demande
            <Text style={styles.required}> *</Text>
          </Text>

          <Pressable
            style={styles.select}
            onPress={() => setShowTypes(!showTypes)}
          >
            <View style={styles.selectLeft}>
              <View style={styles.fieldIcon}>
                <FileText size={SIZES.iconMD} color={COLORS.primary} />
              </View>

              <Text
                style={[styles.selectText, !selectedType && styles.placeholder]}
              >
                {selectedType?.label ?? "Sélectionner un type"}
              </Text>
            </View>

            <ChevronDown size={SIZES.iconMD} color={COLORS.textSecondary} />
          </Pressable>

          {showTypes && (
            <View style={styles.options}>
              {TYPES.map((item) => (
                <Pressable
                  key={item.value}
                  style={[
                    styles.option,
                    type === item.value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setType(item.value);
                    setShowTypes(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      type === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>

          <Pressable
            style={styles.inputContainer}
            onPress={() => setShowPicker(true)}
          >
            <CalendarDays size={SIZES.iconMD} color={COLORS.textSecondary} />

            <Text style={[styles.dateText, !date && styles.placeholder]}>
              {date ? formatDisplay(date) : "JJ/MM/AAAA"}
            </Text>

            {date && (
              <Pressable onPress={() => setDate(null)} hitSlop={10}>
                <X size={SIZES.iconMD} color={COLORS.textSecondary} />
              </Pressable>
            )}
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={getToday()}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Motif */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Motif
            <Text style={styles.required}> *</Text>
          </Text>

          <TextInput
            value={motif}
            onChangeText={setMotif}
            placeholder="Expliquez votre demande..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
            style={styles.textarea}
          />

          <Text style={styles.helper}>
            Décrivez brièvement la raison de votre demande.
          </Text>
        </View>

        {/* Pièce jointe */}
        <View style={styles.section}>
          <Text style={styles.label}>Pièce jointe</Text>

          {!file ? (
            <Pressable
              style={({ pressed }) => [
                styles.attachmentButton,
                pressed && styles.pressed,
              ]}
              onPress={handleAttachment}
            >
              <Paperclip size={SIZES.iconMD} color={COLORS.primary} />

              <View style={styles.attachmentContent}>
                <Text style={styles.attachmentTitle}>Ajouter un fichier</Text>
                <Text style={styles.attachmentSubtitle}>PDF, JPG ou PNG</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <FileText size={SIZES.iconMD} color={COLORS.primary} />
              </View>

              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>

              <Pressable
                onPress={() => setFile(null)}
                style={styles.removeButton}
              >
                <X size={SIZES.iconMD} color={COLORS.textSecondary} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>À savoir</Text>

          <Text style={styles.infoText}>
            Votre demande sera transmise à l'administration pour traitement.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={mutation.isPending}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitPressed,
            mutation.isPending && styles.submitDisabled,
          ]}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Send size={SIZES.iconMD} color={COLORS.white} />
          )}

          <Text style={styles.submitText}>
            {mutation.isPending ? "Envoi..." : "Envoyer la demande"}
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 82,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spaceLG,
    paddingTop: SIZES.spaceLG,
    paddingBottom: SIZES.spaceMD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerTitle: {
    fontSize: SIZES.textXL,
    fontWeight: 600,
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
  },

  content: {
    padding: SIZES.spaceLG,
  },

  section: {
    marginBottom: SIZES.spaceLG,
  },

  label: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.text,
    marginBottom: SIZES.spaceSM,
  },

  required: {
    color: COLORS.danger,
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
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.spaceSM,
  },

  selectText: {
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.textMuted,
  },

  options: {
    marginTop: SIZES.spaceXS,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.small,
  },

  option: {
    paddingHorizontal: SIZES.spaceMD,
    paddingVertical: SIZES.spaceMD,
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

  dateText: {
    flex: 1,
    marginLeft: SIZES.spaceSM,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  textarea: {
    minHeight: 130,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    paddingHorizontal: SIZES.spaceMD,
    paddingVertical: SIZES.spaceMD,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  helper: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
  },

  attachmentButton: {
    minHeight: 72,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: SIZES.radiusMD,
    padding: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  attachmentContent: {
    marginLeft: SIZES.spaceMD,
  },

  attachmentTitle: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.text,
  },

  attachmentSubtitle: {
    marginTop: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
  },

  fileCard: {
    minHeight: 60,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.spaceSM,
    flexDirection: "row",
    alignItems: "center",
  },

  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  fileName: {
    flex: 1,
    marginHorizontal: SIZES.spaceSM,
    fontSize: SIZES.textSM,
    color: COLORS.text,
  },

  removeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBox: {
    backgroundColor: COLORS.infoLight,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceLG,
  },

  infoTitle: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.info,
    marginBottom: SIZES.spaceXS,
  },

  infoText: {
    fontSize: SIZES.textXS,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  submitButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  submitPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  submitDisabled: {
    opacity: 0.7,
  },

  submitText: {
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.white,
  },

  bottomSpace: {
    height: SIZES.space2XL,
  },
});
