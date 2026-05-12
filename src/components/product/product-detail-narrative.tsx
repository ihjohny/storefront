"use client";

import { useRef, type ReactNode } from "react";
import { CmsRichText } from "@/components/cms/cms-rich-text";
import { lexicalToPlainText } from "@/lib/utils/lexical-plain-text";
import { isLexicalSerializedState } from "@/lib/utils/lexical-rich-text";
import type { Product } from "@/lib/types/product";

function DisclosureChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductDetailsDisclosure({
  sectionTitle,
  defaultOpen,
  seeLessLabel,
  children,
}: {
  sectionTitle: string;
  defaultOpen: boolean;
  seeLessLabel: string;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function handleSeeLess() {
    const root = detailsRef.current;
    if (!root) return;
    root.open = false;
    const summary = root.querySelector("summary");
    requestAnimationFrame(() => {
      summary?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <details
      ref={detailsRef}
      open={defaultOpen}
      className="group scroll-mt-24 rounded-xl border border-border bg-muted/30 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
        <span>{sectionTitle}</span>
        <DisclosureChevron className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-2 sm:px-5">
        {children}
        <div className="mt-6 flex justify-center border-t border-border/60 pt-4 sm:justify-start">
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={handleSeeLess}
          >
            {seeLessLabel}
          </button>
        </div>
      </div>
    </details>
  );
}

type ProductDetailNarrativeProps = {
  product: Product;
  sectionTitle: string;
  /** Wrap in native disclosure (recommended on PDP to reduce dead space beside tall galleries). */
  collapsible?: boolean;
  /** Used when `collapsible` is true. */
  defaultOpen?: boolean;
  /** Footer control when expanded (`collapsible`); collapses and scrolls summary into view. */
  seeLessLabel?: string;
};

/**
 * Full product description: renders Payload Lexical JSON with the same editor as Admin.
 */
export function ProductDetailNarrative({
  product,
  sectionTitle,
  collapsible = false,
  defaultOpen = false,
  seeLessLabel,
}: ProductDetailNarrativeProps) {
  const desc = product.description;
  const short = product.shortDescription?.trim() ?? null;

  if (desc == null) {
    return null;
  }

  if (isLexicalSerializedState(desc)) {
    const plain = lexicalToPlainText(desc);
    if (short && plain && plain === short) {
      return null;
    }
    const inner = (
      <div className="prose prose-neutral max-w-none text-base leading-relaxed dark:prose-invert prose-p:mb-3 prose-headings:mb-2 prose-headings:mt-6 prose-headings:scroll-mt-20 prose-h2:text-lg prose-h3:text-base">
        <CmsRichText data={desc} />
      </div>
    );
    if (!collapsible) {
      return (
        <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {sectionTitle}
          </h2>
          <div className="mt-3">{inner}</div>
        </section>
      );
    }
    if (seeLessLabel) {
      return (
        <ProductDetailsDisclosure
          sectionTitle={sectionTitle}
          defaultOpen={defaultOpen}
          seeLessLabel={seeLessLabel}
        >
          {inner}
        </ProductDetailsDisclosure>
      );
    }
    return (
      <details
        open={defaultOpen}
        className="group scroll-mt-24 rounded-xl border border-border bg-muted/30 [&_summary::-webkit-details-marker]:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
          <span>{sectionTitle}</span>
          <DisclosureChevron className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-border px-4 pb-4 pt-2 sm:px-5">{inner}</div>
      </details>
    );
  }

  const full = typeof desc === "string" ? desc.trim() : (lexicalToPlainText(desc) ?? "");
  if (!full) {
    return null;
  }
  if (short && full === short) {
    return null;
  }

  const inner = (
    <div className="max-w-prose whitespace-pre-wrap text-base leading-relaxed text-foreground">
      {full}
    </div>
  );

  if (!collapsible) {
    return (
      <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionTitle}
        </h2>
        <div className="mt-3">{inner}</div>
      </section>
    );
  }

  if (seeLessLabel) {
    return (
      <ProductDetailsDisclosure
        sectionTitle={sectionTitle}
        defaultOpen={defaultOpen}
        seeLessLabel={seeLessLabel}
      >
        {inner}
      </ProductDetailsDisclosure>
    );
  }

  return (
    <details
      open={defaultOpen}
      className="group scroll-mt-24 rounded-xl border border-border bg-muted/30 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground sm:px-5">
        <span>{sectionTitle}</span>
        <DisclosureChevron className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-2 sm:px-5">{inner}</div>
    </details>
  );
}
