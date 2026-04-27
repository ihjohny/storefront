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

/** HttpOnly `payload-token` on the storefront origin; required for /account RSC layout. */
async function syncPayloadSessionCookie(token: string, exp: number | undefined) {
  const res = await fetch("/api/auth/sync-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, exp }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Session cookie could not be set (${res.status}). ${errText}`.trim(),
    );
  }
}

type RegisterData = {
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
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
    if (!result.token) {
      throw new Error("Login did not return a session token. Check the API /auth/login response.");
    }
    setUser(result.user);
    setAuthToken(result.token);
    await syncPayloadSessionCookie(result.token, result.exp);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    clearAuthToken();
    await fetch("/api/auth/sync-token", { method: "DELETE" }).catch(() => {});
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await registerRequest(data);
    const identifier = data.email?.trim() || data.phone?.trim() || "";
    if (!identifier) {
      await refresh();
      return;
    }
    clearAuthToken();
    const result = await loginRequest(identifier, data.password);
    if (!result.token) {
      await refresh();
      return;
    }
    setUser(result.user);
    setAuthToken(result.token);
    await syncPayloadSessionCookie(result.token, result.exp);
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
