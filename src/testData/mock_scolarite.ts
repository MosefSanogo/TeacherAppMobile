import { COLORS } from "@/constants/theme";
import { QuickActionCardProps } from "@/types/quickActionCardProps";
import {
    BarChart3,
    ClipboardList,
    FileText,
    UserCheck,
} from "lucide-react-native";

export const schoolActions: QuickActionCardProps[] = [
  {
    title: "Évaluations",
    subtitle: "Créer et gérer les évaluations",
    icon: ClipboardList,
    color: COLORS.primary,
    navigation: "Evaluations",
  },
  {
    title: "Compositions",
    subtitle: "Gérer les compositions",
    icon: FileText,
    color: COLORS.secondary,
    navigation: "Compositions",
  },
  {
    title: "Présences",
    subtitle: "Suivre les présences et absences",
    icon: UserCheck,
    color: COLORS.info,
    navigation: "Presences",
  },
  {
    title: "Résultats",
    subtitle: "Consulter les résultats des élèves",
    icon: BarChart3,
    color: COLORS.success,
    navigation: "Resultats",
  },
];
