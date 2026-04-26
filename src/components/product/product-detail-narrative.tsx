"use client";

import { CmsRichText } from "@/components/cms/cms-rich-text";
import { lexicalToPlainText } from "@/lib/utils/lexical-plain-text";
import { isLexicalSerializedState } from "@/lib/utils/lexical-rich-text";
import type { Product } from "@/lib/types/product";

type ProductDetailNarrativeProps = {
  product: Product;
  sectionTitle: string;
};

/**
 * Full product description: renders Payload Lexical JSON with the same editor as Admin.
 */
export function ProductDetailNarrative({ product, sectionTitle }: ProductDetailNarrativeProps) {
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
    return (
      <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionTitle}
        </h2>
        <div className="prose prose-neutral mt-3 max-w-none text-base leading-relaxed dark:prose-invert prose-p:mb-3 prose-headings:mb-2 prose-headings:mt-6 prose-headings:scroll-mt-20 prose-h2:text-lg prose-h3:text-base">
          <CmsRichText data={desc} />
        </div>
      </section>
    );
  }

  const full = typeof desc === "string" ? desc.trim() : (lexicalToPlainText(desc) ?? "");
  if (!full) {
    return null;
  }
  if (short && full === short) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {sectionTitle}
      </h2>
      <div className="mt-3 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {full}
      </div>
    </section>
  );
}
