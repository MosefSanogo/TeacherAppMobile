import { api } from "./api";

export type AffectationType = {
  id: number;
  name: string;
  niveau: string;
  idC: number;
  matiere: string;
};

const getAffectations = async (
  id: number | string,
): Promise<AffectationType[]> => {
  try {
    const response = await api.get(`/affectations/findAll/${id}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export default {
  getAffectations,
};
