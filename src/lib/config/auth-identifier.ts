/**
 * Mirrors backend AUTH_REQUIRED_IDENTIFIER (see BS-Commerce `lib/auth-config.ts`).
 * Set NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER on the storefront to match the API env.
 */
export type AuthRequiredIdentifier = "email" | "phone" | "either";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getAuthRequiredIdentifier(): AuthRequiredIdentifier {
  const v = process.env.NEXT_PUBLIC_AUTH_REQUIRED_IDENTIFIER?.toLowerCase();
  if (v === "email" || v === "phone" || v === "either") return v;
  return "either";
}

/** Maps user input to Payload `POST /users/forgot-password` body (email or username lookup). */
export function toForgotPasswordPayload(
  raw: string,
): { email: string } | { username: string } {
  const mode = getAuthRequiredIdentifier();
  const trimmed = raw.trim();
  if (mode === "email") {
    return { email: trimmed.toLowerCase() };
  }
  if (mode === "phone") {
    return { username: trimmed.toLowerCase() };
  }
  const lower = trimmed.toLowerCase();
  if (EMAIL_REGEX.test(lower)) {
    return { email: lower };
  }
  return { username: trimmed.toLowerCase() };
}

export function isValidForgotPasswordInput(
  raw: string,
): { ok: true } | { ok: false; message: string } {
  const v = raw.trim();
  if (!v) {
    return { ok: false, message: "This field is required." };
  }
  const mode = getAuthRequiredIdentifier();
  if (mode === "email") {
    if (!EMAIL_REGEX.test(v.toLowerCase())) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    return { ok: true };
  }
  if (mode === "phone") {
    if (v.length < 5) {
      return { ok: false, message: "Please enter a valid phone number." };
    }
    return { ok: true };
  }
  if (EMAIL_REGEX.test(v.toLowerCase())) {
    return { ok: true };
  }
  if (v.length < 5) {
    return { ok: false, message: "Enter a valid email or phone number." };
  }
  return { ok: true };
}

export function getForgotPasswordFieldProps(): {
  label: string;
  placeholder: string;
  autoComplete: string;
  inputType: "email" | "tel" | "text";
} {
  const mode = getAuthRequiredIdentifier();
  if (mode === "email") {
    return {
      label: "Email",
      placeholder: "you@example.com",
      autoComplete: "email",
      inputType: "email",
    };
  }
  if (mode === "phone") {
    return {
      label: "Phone number",
      placeholder: "+8801XXXXXXXXX",
      autoComplete: "tel",
      inputType: "tel",
    };
  }
  return {
    label: "Email or phone number",
    placeholder: "you@example.com or +880…",
    autoComplete: "username",
    inputType: "text",
  };
}

export function getForgotPasswordSubmitLabel(): string {
  const mode = getAuthRequiredIdentifier();
  return mode === "email" ? "Send reset link" : "Send reset instructions";
}
