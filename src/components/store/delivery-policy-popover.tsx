"use client";

import { useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ServiceTier } from "@/lib/types/geography";

export function DeliveryPolicyPopover({
  tier,
  extendedFeeNote,
  extendedLeadTimeNote,
  unservedMsg,
}: {
  tier: ServiceTier;
  extendedFeeNote: string | null;
  extendedLeadTimeNote: string | null;
  unservedMsg: string | null;
}) {
  const fullText = useMemo(() => {
    if (tier === "unserved") {
      return (
        unservedMsg?.trim() ||
        "Delivery is not available for this area. Try another location."
      );
    }
    if (tier === "extended") {
      const lines = [extendedFeeNote?.trim(), extendedLeadTimeNote?.trim()].filter(
        (line): line is string => Boolean(line),
      );
      if (lines.length > 0) {
        return lines.join("\n\n");
      }
      return "Extended delivery area: additional time or fees may apply.";
    }
    return null;
  }, [tier, extendedFeeNote, extendedLeadTimeNote, unservedMsg]);

  if (tier === "standard") {
    return null;
  }

  if (!fullText) {
    return null;
  }

  const isUnserved = tier === "unserved";
  const triggerLabel = isUnserved
    ? "Why delivery is unavailable for this area"
    : "Delivery details for this area";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isUnserved
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          }`}
          aria-label={triggerLabel}
        >
          {isUnserved ? (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M10 3.5 17 16H3L10 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M10 8v4M10 13h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 9v5M10 6.5h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-[60] max-h-[min(70vh,22rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground shadow-lg outline-none"
        >
          <p className="whitespace-pre-wrap">{fullText}</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
