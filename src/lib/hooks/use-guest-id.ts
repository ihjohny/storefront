"use client";

import { useEffect, useState } from "react";
import { GUEST_ID_KEY } from "@/lib/utils/constants";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function useGuestId(): string | null {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
}

export function getGuestId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(GUEST_ID_KEY);
}

export function clearGuestId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_ID_KEY);
  }
}
