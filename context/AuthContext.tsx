"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "employee";

type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
} | null;

interface AuthContextType {
  user: User;
  token: string | null;
  login: (userData: { email: string; name: string; token: string }, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser({ ...parsedUser, token: storedToken });
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: { email: string; name: string; token: string }, role: UserRole) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      role,
      token: userData.token,
    };

    // Update state and localStorage
    setUser(newUser);
    setToken(userData.token);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", userData.token);

    // Redirect to appropriate dashboard based on role
    const redirectPath =
      role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    window.location.href = redirectPath;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
