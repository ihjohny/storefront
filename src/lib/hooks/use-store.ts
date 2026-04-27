"use client";

import { useContext } from "react";
import { StoreContext, type StoreContextType } from "@/providers/store-provider";

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
