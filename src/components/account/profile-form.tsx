"use client";

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
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  user: User;
  onSaved: () => Promise<void>;
};

export function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      locale: user.locale || "en",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords must match" });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await updateUser(user.id, {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        displayName: values.displayName || "",
        locale: values.locale,
        password: values.newPassword || undefined,
      });
      await onSaved();
      setMessage("Profile updated successfully.");
    } finally {
      setIsSaving(false);
    }
  }

  async function onVerifyEmail() {
    if (!user.email) return;
    await sendVerification(user.email, "email");
    setMessage("Verification email sent.");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">First Name</span>
          <input
            {...form.register("firstName")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Last Name</span>
          <input
            {...form.register("lastName")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Display Name</span>
        <input
          {...form.register("displayName")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Locale</span>
        <select
          {...form.register("locale")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="en">English</option>
          <option value="bn">Bangla</option>
        </select>
      </label>

      <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span>Email: {user.email || "-"}</span>
          <Badge variant={user.emailVerified ? "success" : "warning"}>
            {user.emailVerified ? "Verified" : "Unverified"}
          </Badge>
          {!user.emailVerified && user.email ? (
            <button
              type="button"
              onClick={() => void onVerifyEmail()}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
            >
              Verify
            </button>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span>Phone: {user.phone || "-"}</span>
          <Badge variant={user.phoneVerified ? "success" : "warning"}>
            {user.phoneVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">New Password</span>
          <input
            type="password"
            {...form.register("newPassword")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Confirm Password</span>
          <input
            type="password"
            {...form.register("confirmPassword")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
