import { api } from "./api";

const register = async (data: any) => {
  try {
    const response = await api.post(`/evaluations/create`, data);
    return response.data;
  } catch (error) {}
};
const deleteEval = async (id: number) => {
  try {
    const response = await api.delete(`/evaluations/delete/${id}`);
    return response.data;
  } catch (error) {}
};
export default {
  register,
  deleteEval,
};
