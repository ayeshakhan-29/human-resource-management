"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserType = {
  id: string;
  email: string;
  name?: string;
  token?: string;
  role?: string;
};

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // optional: keep token in auth header or refresh logic
  }, []);

  const login = (userData: UserType) => {
    console.log("Login called with userData:", userData);
    console.log("User role:", userData.role);
    
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", userData.token || "");
      localStorage.setItem("user", JSON.stringify(userData));
    }

    const role = (userData.role || "employee").toString().toLowerCase();
    console.log("Processed role (lowercase):", role);
    
    if (role === "admin" || role === "manager") {
      console.log("Redirecting to admin dashboard");
      router.push("/admin/dashboard");
    } else if (role === "client") {
      console.log("Redirecting to client dashboard");
      router.push("/client/dashboard");
    } else {
      console.log("Redirecting to employee dashboard");
      router.push("/employee/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
