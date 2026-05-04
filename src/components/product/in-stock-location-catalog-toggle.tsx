"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type InStockLocationCatalogToggleProps = {
  /** When false, renders nothing (caller gates on server-selected store + flags). */
  enabled: boolean;
  label: string;
  hint?: string;
};

export function InStockLocationCatalogToggle({
  enabled,
  label,
  hint,
}: InStockLocationCatalogToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!enabled) {
    return null;
  }

  const restrictToLocationStock = searchParams.get("inStockAtStore") !== "0";

  function setRestrict(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.delete("inStockAtStore");
    } else {
      params.set("inStockAtStore", "0");
    }
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm">
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={restrictToLocationStock}
          onChange={(e) => setRestrict(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <span>
          <span className="font-medium text-foreground">{label}</span>
          {hint ? (
            <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </span>
      </label>
    </div>
  );
}
