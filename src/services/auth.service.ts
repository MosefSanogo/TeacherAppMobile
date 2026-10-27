import { api } from "./api";
const login = async (data: object) => {
  const response = await api.post(`/auth/login`, data);
  console.log(response);
  return response.data;
};
export default {
  login,
};
