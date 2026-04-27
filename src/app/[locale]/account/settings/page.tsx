"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProfileForm } from "@/components/account/profile-form";

export default function AccountSettingsPage() {
  const { user, refresh } = useAuth();

  const onSaved = useCallback(async () => {
    await refresh();
  }, [refresh]);

  if (!user) {
    return null;
  }

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Account settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, preferences, and password.
        </p>
      </header>
      <ProfileForm user={user} onSaved={onSaved} />
    </section>
  );
}
