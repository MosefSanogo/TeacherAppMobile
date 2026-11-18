import { api } from "./api";

const register = async (data: FormData) => {
  const response = await api.post("/demandes/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const getProfDemandes = async (id: number) => {
  const response = await api.get(`/demandes/findAll/${id}`);
  return response.data;
};

export default {
  register,
  getProfDemandes,
};
