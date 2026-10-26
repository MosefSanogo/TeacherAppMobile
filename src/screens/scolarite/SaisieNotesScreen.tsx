import { Save } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ThemeEmptyData from "@/components/theme-empty-data";
import ThemeHarder from "@/components/theme-hearder";
import ThemedSearchBar from "@/components/theme-search-box";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import {
  NoteForm,
  ScolariteStackNavigationProp,
} from "@/navigation/stacks/ScolariteStack";
import evaluationService from "@/services/evaluation.service";
import noteService from "@/services/note.service";
import studentService from "@/services/student.service";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

type Eleve = {
  id: number;
  nom: string;
  prenom: string;
  note?: string;
};

export default function SaisieNotesScreen() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [edit, setEdit] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const route = useRoute();
  const { noteForm } = route.params as { noteForm: NoteForm };
  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: ["eleves", noteForm.classeId, noteForm.annee],
    queryFn: async () => {
      try {
        const data = await studentService.getStudents(
          noteForm.classeId,
          noteForm.annee,
        );
        return data;
      } catch (error) {
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (students) {
      setEleves(
        students.map((eleve: any) => ({
          id: eleve.id,
          nom: eleve.nom,
          prenom: eleve.prenom,
        })),
      );
    }
  }, [students]);

  const handleNoteChange = (id: number, value: string) => {
    // Autorise uniquement les nombres et le point
    const cleanedValue = value.replace(",", ".").replace(/[^0-9.]/g, "");

    // Évite plusieurs points
    const parts = cleanedValue.split(".");

    if (parts.length > 2) {
      return;
    }

    // Vérifie que la note ne dépasse pas la note maximale
    const numericValue = Number(cleanedValue);

    if (cleanedValue !== "" && numericValue > noteForm.noteSur) {
      return;
    }
    setEdit(true);
    setEleves((current) =>
      current.map((eleve) =>
        eleve.id === id
          ? {
              ...eleve,
              note: cleanedValue,
            }
          : eleve,
      ),
    );
  };

  const handleSave = async () => {
    setLoader(true);
    const notes = eleves.map((eleve) => ({
      id: eleve.id,
      prenom: eleve.prenom,
      nom: eleve.nom,
      note: eleve.note ? Number(eleve.note) : null,
    }));

    try {
      let response = null;
      if (noteForm.type === "evaluation") {
        response = await noteService.create({
          eleves: notes,
          idE: noteForm.evalId,
        });
      } else if (noteForm.type === "composition") {
        response = await noteService.createComp({
          eleves: notes.map((item) => ({ id: item.id, note: item.note })),
          mat: noteForm.matiere,
          annee: noteForm.annee,
          idC: noteForm.classeId,
          idE: Number(noteForm.evalId),
        });
      }
      setLoader(false);
      if (response) {
        Alert.alert(
          "Confirmation",
          "Les notes ont été enregsitrées avec succès",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: "MainTabs", params: { screen: "Scolarite" } },
                  ],
                });
              },
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer les notes. Veuillez reessayer.",
      );
      setLoader(false);
    }
  };

  const handleBack = async () => {
    try {
      if (edit) {
        Alert.alert(
          "Confirmation",
          "Voulez-vous vraiment quitter sans enregistrer ?",
          [
            {
              text: "Annuler",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "Quitter",
              onPress: async () => {
                try {
                  if (noteForm.type === "evaluation") {
                    await evaluationService.deleteEval(Number(noteForm.evalId));
                  }
                  navigation.goBack();
                } catch (error) {}
              },
              style: "destructive",
            },
          ],
          { cancelable: true },
        );
      } else {
        try {
          if (noteForm.type === "evaluation") {
            await evaluationService.deleteEval(Number(noteForm.evalId));
          }
          navigation.goBack();
        } catch (error) {}
      }
    } catch (error) {}
  };

  const renderEleve = ({ item, index }: { item: Eleve; index: number }) => {
    return (
      <View style={styles.studentRow}>
        {/* Numéro */}
        <View style={styles.numberContainer}>
          <Text style={styles.number}>{index + 1}</Text>
        </View>

        {/* Nom / prénom */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.nom}
          </Text>

          <Text style={styles.studentFirstName} numberOfLines={1}>
            {item.prenom}
          </Text>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <TextInput
            value={item.note ?? ""}
            onChangeText={(value) => handleNoteChange(item.id, value)}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={COLORS.textMuted}
            style={styles.noteInput}
            maxLength={5}
          />

          <Text style={styles.noteMax}>/{noteForm.noteSur}</Text>
        </View>
      </View>
    );
  };
  const elevesFilter = eleves.filter(
    (eleve) =>
      eleve.nom.toLowerCase().includes(searchValue.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const nombreNotes = eleves.filter(
    (eleve) => eleve.note !== undefined && eleve.note !== "",
  ).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <ThemeHarder
        title={`Contrôle de ${noteForm.matiere}`}
        onBackPress={handleBack}
      />
      <View style={{ marginBottom: 15 }}></View>
      <ThemedSearchBar value={searchValue} onChangeText={setSearchValue} />
      {/* Progression */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Notes saisies</Text>

          <Text style={styles.progressCount}>
            {nombreNotes}/{eleves.length}
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  eleves.length > 0 ? (nombreNotes / eleves.length) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {/* En-tête tableau */}
      <View style={styles.tableHeader}>
        <Text style={styles.numberHeader}>#</Text>

        <Text style={styles.studentHeader}>ÉLÈVE</Text>

        <Text style={styles.noteHeader}>NOTE</Text>
      </View>

      {/* Liste élèves */}
      <FlatList
        data={elevesFilter}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEleve}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <ThemeEmptyData
              icon="person"
              titre="Aucun élève trouvé"
              message="Aucun élève ne correspond à votre recherche."
            />
          )
        }
      />

      {/* Bouton enregistrer */}
      <View style={styles.bottomContainer}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <Save size={SIZES.iconMD} color={COLORS.white} />

          <Text style={styles.saveButtonText}>Enregistrer les notes</Text>
        </Pressable>
      </View>
      {loader && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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

  evaluationCard: {
    margin: SIZES.spaceLG,
    marginBottom: SIZES.spaceSM,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.spaceMD,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.small,
  },

  evaluationInfo: {
    flex: 1,
  },

  evaluationLabel: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
    marginBottom: SIZES.spaceXS,
  },

  evaluationTitle: {
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
  },

  noteBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusMD,
    paddingHorizontal: SIZES.spaceMD,
    paddingVertical: SIZES.spaceSM,
  },

  noteBadgeText: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.primary,
  },

  progressCard: {
    marginHorizontal: SIZES.spaceLG,
    marginBottom: SIZES.spaceMD,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.spaceSM,
  },

  progressTitle: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },

  progressCount: {
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.primary,
  },

  progressBackground: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: SIZES.radiusFull,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull,
  },

  tableHeader: {
    height: 36,
    paddingHorizontal: SIZES.spaceLG,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  numberHeader: {
    width: 32,
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.textMuted,
  },

  studentHeader: {
    flex: 1,
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.textMuted,
  },

  noteHeader: {
    width: 90,
    textAlign: "center",
    fontSize: SIZES.textXS,
    fontWeight: 600,
    color: COLORS.textMuted,
  },

  listContent: {
    paddingHorizontal: SIZES.spaceLG,
    paddingBottom: 110,
  },

  studentRow: {
    minHeight: 68,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spaceSM,
    paddingHorizontal: SIZES.spaceSM,
    flexDirection: "row",
    alignItems: "center",
  },

  numberContainer: {
    width: 32,
    alignItems: "center",
  },

  number: {
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
    fontWeight: 600,
  },

  studentInfo: {
    flex: 1,
    paddingHorizontal: SIZES.spaceSM,
  },

  studentName: {
    fontSize: SIZES.textSM,
    fontWeight: 500,
    color: COLORS.text,
  },

  studentFirstName: {
    marginTop: 2,
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },

  noteContainer: {
    width: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  noteInput: {
    width: 54,
    height: 42,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSM,
    textAlign: "center",
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.text,
  },

  noteMax: {
    marginLeft: SIZES.spaceXS,
    fontSize: SIZES.textXS,
    color: COLORS.textMuted,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.spaceMD,
    paddingBottom: SIZES.spaceLG,
  },

  saveButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.spaceSM,
    ...SHADOWS.small,
  },

  saveButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  saveButtonText: {
    fontSize: SIZES.textMD,
    fontWeight: 500,
    color: COLORS.white,
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
});
