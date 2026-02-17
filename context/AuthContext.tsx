"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserType = {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
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
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", userData.token || "");
      localStorage.setItem("user", JSON.stringify(userData));
    }

    const role = (userData.role || "employee").toString().toLowerCase();

    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "manager") {
      router.push("/manager/dashboard");
    } else if (role === "client") {
      router.push("/client/dashboard");
    } else {
      router.push("/employee/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token: user?.token }}>
      {children}
    </AuthContext.Provider>
  );
}
