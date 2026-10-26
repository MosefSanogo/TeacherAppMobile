import { api } from "./api";

const register = async (data: FormData) => {
  try {
    const response = await api.post("/demandes/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {}
};

const getProfDemandes = async (id: number) => {
  try {
    const response = await api.get(`/demandes/findAll/${id}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export default {
  register,
  getProfDemandes,
};
