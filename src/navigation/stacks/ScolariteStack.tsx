import { NativeStackNavigationProp } from "@react-navigation/native-stack";
export type NoteForm = {
  noteSur: number;
  matiere: string;
  annee: string;
  classeId: number;
  evalId: string;
  type: string;
};
export type ClasseType = {
  id: number;
  lib: string;
};
export type ScolariteStackParamList = {
  MainTabs: { screen?: string };
  Evaluations: undefined;
  Compositions: undefined;
  Classes: { classe: ClasseType };
  Presences: undefined;
  SaisieNote: { noteForm: NoteForm };
  Resultats: undefined;
  ResultatEleve: {
    resultatEleve: {
      idEleve: number;
      nom: string;
      prenom: string;
      idC: number;
      annee: string;
      matieresProf: string[]; // matières enseignées par le prof dans cette classe
    };
  };
  HistoriquePaie: undefined;
  StudentProfil: {
    studentProfil: {
      idEleve: number;
      mat: string; // nom de la matière (comme enregistré dans createPresence)
      idC: number; // id de la classe
      annee: string;
    };
  };
};
export type ScolariteStackNavigationProp =
  NativeStackNavigationProp<ScolariteStackParamList>;
