"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/hooks/use-cart";

export type CartCustomerNoteLabels = {
  label: string;
  placeholder: string;
  hint: string;
  saving: string;
  saved: string;
};

type CartCustomerNoteProps = {
  labels: CartCustomerNoteLabels;
};

export function CartCustomerNote({ labels }: CartCustomerNoteProps) {
  const { cartId, customerNote, saveCustomerNote } = useCart();
  const [draft, setDraft] = useState(customerNote);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const focusedRef = useRef(false);

  /* Sync from server only when the shopper is not actively editing (avoids cursor jumps). */
  useEffect(() => {
    if (focusedRef.current) {
      return;
    }
    setDraft(customerNote);
  }, [customerNote]);

  const persistIfDirty = useCallback(async () => {
    if (!cartId || draft === customerNote) {
      return;
    }
    setStatus("saving");
    try {
      await saveCustomerNote(draft);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1600);
    } catch {
      setStatus("idle");
    }
  }, [cartId, customerNote, draft, saveCustomerNote]);

  if (!cartId) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="cart-customer-note" className="text-sm font-medium">
          {labels.label}
        </label>
        {status === "saving" ? (
          <span className="text-xs text-muted-foreground">{labels.saving}</span>
        ) : status === "saved" ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {labels.saved}
          </span>
        ) : null}
      </div>
      <textarea
        id="cart-customer-note"
        rows={3}
        maxLength={2000}
        value={draft}
        placeholder={labels.placeholder}
        onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          void persistIfDirty();
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
      />
      <p className="text-xs text-muted-foreground">{labels.hint}</p>
    </div>
  );
}
