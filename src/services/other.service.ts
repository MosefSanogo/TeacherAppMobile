import { api } from "./api";
export type PeriodeType = {
  id: number;
  lib: string;
};
export type ExamenType = {
  id: number;
  lib: string;
  niveau: string;
  periode: string;
};
const getPeriode = async () => {
  const response = await api.get("/other/periode");
  return response.data;
};

const getExamen = async (
  niveau: string | undefined,
  periode: string | undefined,
): Promise<ExamenType[]> => {
  const response = await api.get<ExamenType[]>(
    `/other/examen/${niveau}/${periode}`,
  );
  return response.data;
};

const createPresence = async (absences: any[], form: any) => {
  const response = await api.post("/other/absences", { absences, form });
  return response.data;
};

const getPaiements = async (idProf: number) => {
  const response = await api.get(`/other/paiements/${idProf}`);
  return response.data;
};

export default {
  getPeriode,
  getExamen,
  createPresence,
  getPaiements,
};
