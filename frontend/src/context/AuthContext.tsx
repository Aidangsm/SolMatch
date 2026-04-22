import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "HOMEOWNER" | "INSTALLER" | "ADMIN";
  installer?: { id: string; companyName: string; verified: boolean; badgeActive: boolean } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "HOMEOWNER" | "INSTALLER";
  consentGiven: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/users/me");
      setUser(data);
    } catch {
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    // Refresh token is set as httpOnly cookie by the server
    setUser(data.user);
  };

  const register = async (formData: RegisterData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
