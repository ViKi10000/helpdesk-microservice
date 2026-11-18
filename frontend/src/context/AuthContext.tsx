
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios.ts";
import type { User, AuthResponse } from "../types/auth.types.ts";
import { AuthContext } from "./auth-context.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the user when the application starts
  useEffect(() => {
  const checkAuth = async () => {
  console.log("Checking authentication...");

  const token = localStorage.getItem("accessToken");
  console.log("Token exists:", !!token);

  if (!token) {
    setLoading(false);
    return;
  }

  try {
    const response = await api.get("/auth/me");

    console.log("Auth response:", response.data);

    setUser(response.data.user);
  } catch (error) {
    console.error("Session restoration failed:", error);
    localStorage.removeItem("accessToken");
    setUser(null);
  } finally {
    setLoading(false);
  }
};

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      const { user, accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
