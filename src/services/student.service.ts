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
  try {
    const response = await api.get<StudentType[]>(
      `/students/students/${id}/${an}`,
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

const getAdmission = async (id: number | string) => {
  try {
    const response = await api.get(`/students/admission/${id}`);
    return response.data;
  } catch (error) {}
};

const getMatricule = async (id: number | string) => {
  try {
    const response = await api.get(`/students/matricule/${id}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

const getPresence = async (id: number | string, an: string) => {
  try {
    const response = await api.get(`/students/presence/${id}/${an}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

const deletePresence = async (id: number | string) => {
  try {
    const response = await api.delete(`/students/delete/presence/${id}`);
    return response.data;
  } catch (error) {}
};

export default {
  getStudents,
  getAdmission,
  getMatricule,
  getPresence,
  deletePresence,
};
