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
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">Profile Settings</h1>
      <ProfileForm user={user} onSaved={onSaved} />
    </section>
  );
}
