import { api } from "./api";
export type StudentType = {
  id: number;
  nom: string;
  prenom: string;
  sexe: string;
  matricule: string;
  statut: string;
};

const getStudents = async (
  id: number | string,
  an: string,
): Promise<StudentType[]> => {
  const response = await api.get<StudentType[]>(
    `/students/students/${id}/${an}`,
  );
  return response.data;
};

const getAdmission = async (id: number | string) => {
  const response = await api.get(`/students/admission/${id}`);
  return response.data;
};

const getMatricule = async (id: number | string) => {
  const response = await api.get(`/students/matricule/${id}`);
  return response.data;
};

const getPresence = async (id: number | string, an: string) => {
  const response = await api.get(`/students/presence/${id}/${an}`);
  return response.data;
};

const deletePresence = async (id: number | string) => {
  const response = await api.delete(`/students/delete/presence/${id}`);
  return response.data;
};

export default {
  getStudents,
  getAdmission,
  getMatricule,
  getPresence,
  deletePresence,
};
