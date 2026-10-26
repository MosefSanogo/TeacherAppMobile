import { api } from "./api";
const login = async (data: object) => {
  try {
    const response = await api.post(`/auth/login`, data);
    return response.data;
  } catch (error) {}
};
export default {
  login,
};
