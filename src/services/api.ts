import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.218:4000/api",
});

// Intercepteur : s'exécute automatiquement AVANT chaque requête HTTP
api.interceptors.request.use(
  async (config) => {
    // 1. Récupération du token stocké
    const token = await AsyncStorage.getItem("userToken");

    // 2. Si le token existe, on l'injecte dans le header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Vérifier l'état réel de la connexion internet
    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      return Promise.reject(new Error("NETWORK_ERROR"));
    }

    if (!error.response) {
      return Promise.reject(new Error("SERVER_UNREACHABLE"));
    }

    return Promise.reject(error);
  },
);
