"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils/format-price";
import { getMediaUrl } from "@/lib/utils/url";

export type BundleItemInsight = {
  key: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  sku?: string | null;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  imageUrl?: string | null;
};

export type BundleItemInsightsCopy = {
  includesTitle: string;
  qtyLabel: string;
  viewDetailsLabel: string;
  regularTotalLabel: string;
  bundlePriceLabel: string;
  savingsLabel: string;
  dialogTitle: string;
  viewOnlyNotice: string;
  goToProductLabel: string;
  closeLabel: string;
  skuLabel: string;
  unitPriceLabel: string;
  compareAtLabel: string;
  quantityLabel: string;
  lineTotalLabel: string;
};

type BundleItemInsightsProps = {
  items: BundleItemInsight[];
  regularTotal: number;
  bundlePrice: number;
  savings: number;
  locale: string;
  copy: BundleItemInsightsCopy;
};

export function BundleItemInsights({
  items,
  regularTotal,
  bundlePrice,
  savings,
  locale,
  copy,
}: BundleItemInsightsProps) {
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.key === activeItemKey) ?? null,
    [activeItemKey, items],
  );

  return (
    <>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.includesTitle}
        </h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {copy.qtyLabel} {item.quantity} x {formatPrice(item.unitPrice, item.currency)}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveItemKey(item.key)}
                  className="mt-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {copy.viewDetailsLabel}
                </button>
              </div>
              <p className="shrink-0 font-medium text-foreground">
                {formatPrice(item.lineTotal, item.currency)}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t border-border pt-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{copy.regularTotalLabel}</span>
            <span>{formatPrice(regularTotal, items[0]?.currency)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>{copy.bundlePriceLabel}</span>
            <span>{formatPrice(bundlePrice, items[0]?.currency)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span>{copy.savingsLabel}</span>
            <span>{formatPrice(savings, items[0]?.currency)}</span>
          </div>
        </div>
      </div>

      <Transition show={Boolean(activeItem)} as={Fragment}>
        <Dialog as="div" className="relative z-70" onClose={() => setActiveItemKey(null)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="transform transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-2 sm:scale-95"
            >
              <DialogPanel className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-2xl sm:p-5">
                {activeItem ? (
                  <div className="space-y-4">
                    <DialogTitle className="text-base font-semibold text-foreground">
                      {copy.dialogTitle}
                    </DialogTitle>
                    <p className="text-sm font-medium text-foreground">{activeItem.title}</p>
                    {(() => {
                      const imageSrc = activeItem.imageUrl ? getMediaUrl(activeItem.imageUrl) : null;
                      return imageSrc ? (
                        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={imageSrc}
                            alt={activeItem.productName ?? activeItem.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 560px"
                          />
                        </div>
                      ) : null;
                    })()}
                    {activeItem.shortDescription ? (
                      <p className="text-sm text-muted-foreground">{activeItem.shortDescription}</p>
                    ) : null}
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {copy.viewOnlyNotice}
                    </p>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">{copy.skuLabel}</dt>
                      <dd className="text-right text-foreground">{activeItem.sku ?? "—"}</dd>
                      <dt className="text-muted-foreground">{copy.unitPriceLabel}</dt>
                      <dd className="text-right text-foreground">
                        {formatPrice(activeItem.unitPrice, activeItem.currency)}
                      </dd>
                      <dt className="text-muted-foreground">{copy.compareAtLabel}</dt>
                      <dd className="text-right text-foreground">
                        {typeof activeItem.compareAtPrice === "number"
                          ? formatPrice(activeItem.compareAtPrice, activeItem.currency)
                          : "—"}
                      </dd>
                      <dt className="text-muted-foreground">{copy.quantityLabel}</dt>
                      <dd className="text-right text-foreground">{activeItem.quantity}</dd>
                      <dt className="text-muted-foreground">{copy.lineTotalLabel}</dt>
                      <dd className="text-right font-semibold text-foreground">
                        {formatPrice(activeItem.lineTotal, activeItem.currency)}
                      </dd>
                    </dl>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {activeItem.productSlug ? (
                        <Link
                          href={`/${locale}/products/${activeItem.productSlug}`}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          {copy.goToProductLabel}
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setActiveItemKey(null)}
                        className="inline-flex min-h-9 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        {copy.closeLabel}
                      </button>
                    </div>
                  </div>
                ) : null}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
