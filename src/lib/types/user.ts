export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "vendor" | "customer";
  status: "active" | "suspended" | "banned";
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  locale: "en" | "bn";
  tenant: { id: string; name: string; slug: string } | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  exp: number;
}

export interface MeResponse {
  user: User | null;
  token?: string;
  exp?: number;
}
