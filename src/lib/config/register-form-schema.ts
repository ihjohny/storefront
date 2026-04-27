import { z } from "zod";
import { getAuthRequiredIdentifier } from "./auth-identifier";

const passwordField = z.string().min(8, "Password must be at least 8 characters");

function emptyOrValidEmail() {
  return z
    .string()
    .refine(
      (s) => s.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()),
      { message: "Invalid email" },
    );
}

function emptyOrValidPhone() {
  return z
    .string()
    .refine(
      (s) => s.trim() === "" || s.trim().length >= 5,
      { message: "Invalid phone number" },
    );
}

/**
 * `NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER` controls which identifier fields the register
 * form shows: email only, phone only, or both (at least one required).
 */
export function getRegisterIdentifierFieldLayout(): {
  showEmail: boolean;
  showPhone: boolean;
} {
  const mode = getAuthRequiredIdentifier();
  if (mode === "email") return { showEmail: true, showPhone: false };
  if (mode === "phone") return { showEmail: false, showPhone: true };
  return { showEmail: true, showPhone: true };
}

export function buildRegisterFormSchema() {
  const mode = getAuthRequiredIdentifier();
  const firstName = z.string().min(1, "First name is required").max(200);
  const lastName = z.string().max(200);

  if (mode === "email") {
    return z
      .object({
        firstName,
        lastName,
        email: z.string().min(1, "Email is required").email("Invalid email"),
        phone: emptyOrValidPhone(),
        password: passwordField,
        confirmPassword: z.string(),
      })
      .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
      });
  }

  if (mode === "phone") {
    return z
      .object({
        firstName,
        lastName,
        email: emptyOrValidEmail(),
        phone: z.string().min(5, "Phone is required"),
        password: passwordField,
        confirmPassword: z.string(),
      })
      .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
      });
  }

  return z
    .object({
      firstName,
      lastName,
      email: emptyOrValidEmail(),
      phone: emptyOrValidPhone(),
      password: passwordField,
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    })
    .refine(
      (d) =>
        (d.email && d.email.trim() !== "") || (d.phone && d.phone.trim() !== ""),
      { message: "Email or phone is required", path: ["email"] },
    );
}

/** All branches of `buildRegisterFormSchema()` use the same field names. */
export type RegisterFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export const registerFormDefaultValues: RegisterFormInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};
