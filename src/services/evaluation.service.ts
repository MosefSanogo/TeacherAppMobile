import { api } from "./api";

const register = async (data: any) => {
  const response = await api.post(`/evaluations/create`, data);
  return response.data;
};
const deleteEval = async (id: number) => {
  const response = await api.delete(`/evaluations/delete/${id}`);
  return response.data;
};
export default {
  register,
  deleteEval,
};
