import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// 1. Définition des types/interfaces
export interface User {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any; // Permet d'ajouter d'autres propriétés dynamiques si besoin
}

interface AuthContextType {
  userToken: string | null;
  userInfo: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}
interface JwtPayload {
  exp: number; // Date d'expiration en secondes (Unix timestamp)
}

// 2. Création du contexte avec un typage fort (undefined par défaut)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  // Connexion
  const login = async (token: string, userData: User): Promise<void> => {
    setIsLoading(true);
    setUserToken(token);
    setUserInfo(userData);
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
    setIsLoading(false);
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userInfo");
    setIsLoading(false);
  };

  // Vérification de la session au démarrage de l'application
  const isLoggedIn = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const data = await AsyncStorage.getItem("userInfo");

      if (token && data) {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expiré -> Nettoyage et déconnexion
          await logout();
        } else {
          // Token valide
          setUserToken(token);
          setUserInfo(JSON.parse(data));
        }
      }
    } catch (e) {
      console.log(`Erreur de restauration de session : ${e}`);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoading,
        userToken,
        userInfo,
        isAuthenticated: !!userToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personnalisé avec sécurité contre l'utilisation hors Provider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
};
