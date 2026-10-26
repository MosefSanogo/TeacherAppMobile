import { NativeStackNavigationProp } from "@react-navigation/native-stack";
export type DemandesStackParamList = {
  Demandes: undefined;
  NouvelleDemande: undefined;
  DemandeDetails: {
    id: number;
  };
};
export type DemandeStackNavigationProp =
  NativeStackNavigationProp<DemandesStackParamList>;
