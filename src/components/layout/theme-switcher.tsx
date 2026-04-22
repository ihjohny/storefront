"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Light / dark / system — drives `html.dark` via next-themes (see globals.css + theme files).
 */
export function ThemeSwitcher({ idPrefix = "theme" }: { idPrefix?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 min-w-30 animate-pulse rounded-md bg-muted"
        aria-hidden
      />
    );
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="sr-only">Color theme</span>
      <select
        id={`${idPrefix}-select`}
        value={theme ?? "system"}
        onChange={(e) => setTheme(e.target.value)}
        className="max-w-36 rounded-md border border-border bg-card py-1 pl-2 pr-6 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
