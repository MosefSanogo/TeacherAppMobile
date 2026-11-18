import { api } from "./api";

const getEmploi = async (id: number, an: string) => {
  const response = await api.get(`/emploi/planning/${id}/${an}`);
  return response.data;
};

const getTodayEmploi = async (id: number, an: string) => {
  const response = await api.get(`/emploi/today/planning/${id}/${an}`);
  return response.data;
};

export default {
  getEmploi,
  getTodayEmploi,
};
