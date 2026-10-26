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
  try {
    const response = await api.get("/other/periode");
    return response.data;
  } catch (error) {
    return [];
  }
};

const getExamen = async (
  niveau: string | undefined,
  periode: string | undefined,
): Promise<ExamenType[]> => {
  try {
    const response = await api.get<ExamenType[]>(
      `/other/examen/${niveau}/${periode}`,
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

const createPresence = async (absences: any[], form: any) => {
  try {
    const response = await api.post("/other/absences", { absences, form });
    return response.data;
  } catch (error) {}
};

const getPaiements = async (idProf: number) => {
  try {
    const response = await api.get(`/other/paiements/${idProf}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export default {
  getPeriode,
  getExamen,
  createPresence,
  getPaiements,
};
