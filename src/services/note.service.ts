import { api } from "./api";

const create = async (data: any) => {
  const response = await api.post(`/notes/create`, data);
  return response.data;
};

const createComp = async (data: any) => {
  const response = await api.post(`/notes/createCompo`, data);
  return response.data;
};

const getStudentNotes = async (idEleve: number, annee: string, idC: number) => {
  const response = await api.get(
    `/notes/findAllNotes/${idEleve}/${annee}/${idC}`,
  );
  return response.data;
};
const getStudentCompo = async (idEleve: number, annee: string, idC: number) => {
  const response = await api.get(
    `/notes/findAllComp/${idEleve}/${annee}/${idC}`,
  );
  return response.data;
};

const updateNote = async (id: number, note: number) => {
  const response = await api.post("/notes/updateNote", { id, note });
  return response.data;
};

const updateCompo = async (id: number, note: number) => {
  const response = await api.post("/notes/updateCompo", { id, note });
  return response.data;
};

export default {
  create,
  createComp,
  getStudentNotes,
  getStudentCompo,
  updateCompo,
  updateNote,
};
