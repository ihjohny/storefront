"use client";

import { useEffect, useState } from "react";
import { GUEST_ID_KEY } from "@/lib/utils/constants";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (HTTP on IP addresses) or environments where crypto.randomUUID is unavailable
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
