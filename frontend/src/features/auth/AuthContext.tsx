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
      // Check if token is a string
      if (typeof token !== 'string') {
        console.error("Token is not a string:", typeof token, token);
        return null;
      }

      // Check if token is empty
      if (!token || token.trim().length === 0) {
        console.error("Token is empty");
        return null;
      }

      // Check JWT format (should have 3 parts separated by dots)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid JWT format - expected 3 parts, got:", parts.length, "Token preview:", token.substring(0, 20) + "...");
        return null;
      }

      const decoded: DecodedToken = jwtDecode(token);

      // Check for expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.error("Token expired");
        return null;
      }

      // Validate the presence of required fields
      if (!decoded.sub) {
        console.error("Missing sub (user ID) in token");
        return null;
      }

      if (!decoded.email) {
        console.error("Missing email in token");
        return null;
      }

      if (!decoded.role) {
        console.error("Missing role in token");
        return null;
      }

      return {
        _id: decoded.sub,
        fullName: decoded.fullName || decoded.email.split("@")[0],
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const login = (token: string) => {
    // Ensure token is a string
    if (typeof token !== 'string') {
      console.error("Login received non-string token:", typeof token, token);
      throw new Error("Token must be a string");
    }

    const userFromToken = decodeToken(token);
    if (!userFromToken) {
      console.error("Failed to decode token during login");
      throw new Error("Invalid or expired token. Please try logging in again.");
    }

    localStorage.setItem("token", token);
    setToken(token);
    setUser(userFromToken);
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

  // Always provide the context value, even during loading
  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
