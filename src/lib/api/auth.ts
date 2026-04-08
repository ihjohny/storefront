import { apiClient } from "./client";
import type { LoginResponse, MeResponse, User } from "../types/user";

type RegisterPayload = {
  email?: string;
  phone?: string;
  password: string;
};

type RegisterResponse = {
  doc: User;
  message: string;
};

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function register(data: RegisterPayload): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/users", {
    method: "POST",
    body: JSON.stringify({ ...data, role: "customer" }),
  });
}

export async function getMe(cookieHeader?: string): Promise<MeResponse> {
  return apiClient<MeResponse>("/users/me", {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
}

export async function logout(): Promise<void> {
  await apiClient("/users/logout", { method: "POST" });
}

export async function updateUser(
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    locale: "en" | "bn";
    password: string;
  }>,
): Promise<User> {
  const response = await apiClient<{ doc: User }>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.doc;
}

export async function sendVerification(
  identifier: string,
  type: "email" | "phone" = "email",
): Promise<void> {
  await apiClient("/auth/send-verification", {
    method: "POST",
    body: JSON.stringify({ identifier, type }),
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailToken(token: string): Promise<void> {
  await apiClient(`/auth/verify-email/${token}`);
}
