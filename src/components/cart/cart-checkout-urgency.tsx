"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/hooks/use-cart";

const STORAGE_KEY = "bs-cart-checkout-deadline-ms";

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

type CartCheckoutUrgencyBannerProps = {
  enabled: boolean;
  durationMinutes: number;
  title: string;
  subtitle: string;
  expiredLabel: string;
};

export function CartCheckoutUrgencyBanner({
  enabled,
  durationMinutes,
  title,
  subtitle,
  expiredLabel,
}: CartCheckoutUrgencyBannerProps) {
  const { itemCount } = useCart();
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || itemCount <= 0) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setDeadlineMs(null);
      return;
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);
    const t = Date.now();
    let d = raw ? Number(raw) : NaN;
    if (!Number.isFinite(d) || d <= t) {
      d = t + durationMinutes * 60 * 1000;
      sessionStorage.setItem(STORAGE_KEY, String(d));
    }
    setDeadlineMs(d);
  }, [enabled, itemCount, durationMinutes]);

  useEffect(() => {
    if (deadlineMs == null) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs]);

  if (!enabled || itemCount <= 0 || deadlineMs == null) {
    return null;
  }

  const remaining = deadlineMs - now;
  const expired = remaining <= 0;

  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 text-sm ${
        expired
          ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
          : "border-primary/30 bg-primary/5 text-foreground"
      }`}
    >
      <p className="font-semibold">{expired ? expiredLabel : title}</p>
      {!expired ? (
        <>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <p className="mt-2 font-mono text-lg font-bold tabular-nums">
            {formatRemaining(remaining)}
          </p>
        </>
      ) : null}
    </div>
  );
}
