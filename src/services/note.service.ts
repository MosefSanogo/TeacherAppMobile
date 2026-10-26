import { api } from "./api";

const create = async (data: any) => {
  try {
    const response = await api.post(`/notes/create`, data);
    return response.data;
  } catch (error) {
    return [];
  }
};

const createComp = async (data: any) => {
  try {
    const response = await api.post(`/notes/createCompo`, data);
    return response.data;
  } catch (error) {
    return [];
  }
};

const getStudentNotes = async (idEleve: number, annee: string, idC: number) => {
  try {
    const response = await api.get(
      `/notes/findAllNotes/${idEleve}/${annee}/${idC}`,
    );
    return response.data;
  } catch (error) {
    return [];
  }
};
const getStudentCompo = async (idEleve: number, annee: string, idC: number) => {
  try {
    const response = await api.get(
      `/notes/findAllComp/${idEleve}/${annee}/${idC}`,
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

const updateNote = async (id: number, note: number) => {
  try {
    const response = await api.post("/notes/updateNote", { id, note });
    return response.data;
  } catch (error) {}
};

const updateCompo = async (id: number, note: number) => {
  try {
    const response = await api.post("/notes/updateCompo", { id, note });
    return response.data;
  } catch (error) {}
};

export default {
  create,
  createComp,
  getStudentNotes,
  getStudentCompo,
  updateCompo,
  updateNote,
};
