"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendVerification, updateUser } from "@/lib/api/auth";
import type { User } from "@/lib/types/user";
import { Badge } from "@/components/shared/badge";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  locale: z.enum(["en", "bn"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50";

type ProfileFormProps = {
  user: User;
  onSaved: () => Promise<void>;
};

export function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      locale: user.locale || "en",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmitProfile(values: ProfileFormValues) {
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      await updateUser(user.id, {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        displayName: values.displayName || "",
        locale: values.locale,
      });
      await onSaved();
      setProfileMessage("Profile saved.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onSubmitPassword(values: PasswordFormValues) {
    setIsSavingPassword(true);
    setPasswordMessage(null);
    try {
      await updateUser(user.id, {
        password: values.newPassword,
      });
      passwordForm.reset({ newPassword: "", confirmPassword: "" });
      await onSaved();
      setPasswordMessage("Password updated.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function onVerifyEmail() {
    if (!user.email) return;
    await sendVerification(user.email, "email");
    setProfileMessage("Verification email sent.");
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={profileForm.handleSubmit(onSubmitProfile)}
        className="space-y-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your name and preferences for this account.
          </p>
        </div>

        {profileMessage ? (
          <p
            role="status"
            className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground"
          >
            {profileMessage}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">First name</span>
            <input {...profileForm.register("firstName")} className={inputClass} autoComplete="given-name" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Last name</span>
            <input {...profileForm.register("lastName")} className={inputClass} autoComplete="family-name" />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Display name</span>
          <input {...profileForm.register("displayName")} className={inputClass} autoComplete="nickname" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Language</span>
          <select {...profileForm.register("locale")} className={inputClass}>
            <option value="en">English</option>
            <option value="bn">Bangla</option>
          </select>
        </label>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Contact & verification</p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{user.email || "—"}</span>
              <Badge variant={user.emailVerified ? "success" : "warning"}>
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
              {!user.emailVerified && user.email ? (
                <button
                  type="button"
                  onClick={() => void onVerifyEmail()}
                  className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Send verification
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{user.phone || "—"}</span>
              <Badge variant={user.phoneVerified ? "success" : "warning"}>
                {user.phoneVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingProfile}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSavingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
        className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set a new password for this account. This is separate from your profile details above.
          </p>
        </div>

        {passwordMessage ? (
          <p
            role="status"
            className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground"
          >
            {passwordMessage}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">New password</span>
            <input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
              className={inputClass}
            />
            {passwordForm.formState.errors.newPassword ? (
              <span className="text-xs text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">At least 8 characters.</span>
            )}
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
              className={inputClass}
            />
            {passwordForm.formState.errors.confirmPassword ? (
              <span className="text-xs text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </span>
            ) : null}
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
          <button
            type="submit"
            disabled={isSavingPassword}
            className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:opacity-60 sm:shrink-0"
          >
            {isSavingPassword ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
