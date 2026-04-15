"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/api/auth";
import { clearAuthToken, setAuthToken } from "@/lib/api/auth-token";
import type { User } from "@/lib/types/user";

type RegisterData = {
  email?: string;
  phone?: string;
  password: string;
};

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await getMe();
      setUser(me.user);
      if (!me.user) {
        clearAuthToken();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    clearAuthToken();
    const result = await loginRequest(identifier, password);
    setUser(result.user);
    if (result.token) {
      setAuthToken(result.token);
      // Sync the auth token to a frontend-scoped cookie so Server Components
      // can forward it to the API backend (cross-origin cookie workaround).
      await fetch("/api/auth/sync-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.token, exp: result.exp }),
      }).catch(() => {});
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    clearAuthToken();
    await fetch("/api/auth/sync-token", { method: "DELETE" }).catch(() => {});
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await registerRequest(data);
    await refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      register,
      refresh,
    }),
    [isLoading, login, logout, refresh, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
