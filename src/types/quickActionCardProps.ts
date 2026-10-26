import { LucideIcon } from "lucide-react-native";

export type QuickActionCardProps = {
  id: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  navigation: string;
};
