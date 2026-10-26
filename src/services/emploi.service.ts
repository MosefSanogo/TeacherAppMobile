import { api } from "./api";

const getEmploi = async (id: number, an: string) => {
  try {
    const response = await api.get(`/emploi/planning/${id}/${an}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

const getTodayEmploi = async (id: number, an: string) => {
  try {
    const response = await api.get(`/emploi/today/planning/${id}/${an}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export default {
  getEmploi,
  getTodayEmploi,
};
