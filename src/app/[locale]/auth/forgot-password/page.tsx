"use client";

import { useState } from "react";
import {
  authErrorClass,
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-form-classes";
import { forgotPassword } from "@/lib/api/auth";
import {
  getAuthRequiredIdentifier,
  getForgotPasswordFieldProps,
  getForgotPasswordSubmitLabel,
  isValidForgotPasswordInput,
} from "@/lib/config/auth-identifier";

const SUCCESS_MESSAGE =
  "If an account exists for that identifier, you will receive password reset instructions shortly.";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const field = getForgotPasswordFieldProps();
  const submitLabel = getForgotPasswordSubmitLabel();
  const mode = getAuthRequiredIdentifier();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    setMessage(null);
    const validation = isValidForgotPasswordInput(identifier);
    if (!validation.ok) {
      setFieldError(validation.message);
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(identifier);
      setMessage(SUCCESS_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Forgot Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className={authLabelClass}>{field.label}</span>
          <input
            data-testid="forgot-password-identifier"
            type={field.inputType}
            required
            autoComplete={field.autoComplete}
            name={mode === "either" ? "identifier" : mode === "email" ? "email" : "tel"}
            placeholder={field.placeholder}
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setFieldError(null);
            }}
            className={authFieldClass}
          />
        </label>
        {fieldError ? <p className={authErrorClass}>{fieldError}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className={authPrimaryButtonClass}
        >
          {isSubmitting ? "Sending…" : submitLabel}
        </button>
      </form>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </main>
  );
}
