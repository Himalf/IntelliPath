import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  sub: string;
  email: string;
  role: string;
  fullName?: string;
  exp: number;
};

type User = {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeToken = (token: string): User | null => {
    try {
      if (!token || token.split(".").length !== 3) {
        console.error("Invalid JWT format");
        return null; // Invalid token format
      }

      const decoded: DecodedToken = jwtDecode(token);

      // Check for expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.error("Token expired");
        return null; // Token expired
      }

      // Validate the presence of all required fields (e.g., role)
      if (!decoded.role) {
        console.error("Missing role in token");
        return null; // Missing role or other required fields
      }

      return {
        _id: decoded.sub,
        fullName: decoded.fullName || decoded.email.split("@")[0],
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      const userFromToken = decodeToken(savedToken);
      if (userFromToken) {
        setToken(savedToken);
        setUser(userFromToken);
      } else {
        logout(); // Invalid or expired token
      }
    } else {
      logout(); // No token in localStorage
    }

    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    const userFromToken = decodeToken(token);
    if (!userFromToken) {
      throw new Error("Invalid or expired token");
    }

    localStorage.setItem("token", token);
    setToken(token);
    setUser(userFromToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
