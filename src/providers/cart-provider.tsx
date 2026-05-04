"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyCoupon as patchCartCoupon,
  clearCartCoupon,
  createCart,
  getCart,
  patchCartCustomerNote,
  removeCartDocument,
  updateCart,
} from "@/lib/api/cart";
import { useAuth } from "@/lib/hooks/use-auth";
import { useGuestId } from "@/lib/hooks/use-guest-id";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import type { Cart, CartItem } from "@/lib/types/cart";

export type CartContextType = {
  cartId: string | null;
  customerNote: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  appliedCouponCode: string | null;
  isLoading: boolean;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => Promise<void>;
  removeItem: (productId: string, variantId: string | null) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  applyCouponCode: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  saveCustomerNote: (note: string) => Promise<void>;
};

type CartMutationItem = {
  product: string;
  variant?: string;
  quantity: number;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

function toEntityId(value: string | { id: string } | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return typeof value === "string" ? value : value.id;
}

function cartItemKey(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? "no-variant"}`;
}

function toMutationItems(items: CartItem[]): CartMutationItem[] {
  return items.map((item) => {
    const productId = toEntityId(item.product);
    const variantId = toEntityId(item.variant);
    return {
      product: productId ?? "",
      variant: variantId ?? undefined,
      quantity: item.quantity,
    };
  });
}

function mergeMutationItems(
  primary: CartMutationItem[],
  secondary: CartMutationItem[],
): CartMutationItem[] {
  const map = new Map<string, CartMutationItem>();

  [...primary, ...secondary].forEach((item) => {
    const key = cartItemKey(item.product, item.variant ?? null);
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }
    map.set(key, { ...item });
  });

  return Array.from(map.values()).filter((item) => item.quantity > 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const guestId = useGuestId();
  const { commerceStore } = useStore();
  const storeId =
    features.multiStore && commerceStore?.id ? commerceStore.id : undefined;
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mergedForUserRef = useRef<string | null>(null);

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal =
    typeof cart?.subtotal === "number"
      ? cart.subtotal
      : items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

  const discountTotal =
    typeof cart?.discountTotal === "number" ? Math.max(0, cart.discountTotal) : 0;

  const appliedCouponCode = cart?.couponCode?.trim() ? cart.couponCode.trim() : null;

  const customerNote = typeof cart?.customerNote === "string" ? cart.customerNote : "";

  const activeUserId = user?.id ?? null;
  const activeGuestId = !activeUserId ? guestId ?? null : null;

  const refreshCart = useCallback(async () => {
    if (!activeUserId && !activeGuestId) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const nextCart = await getCart(activeUserId ?? undefined, activeGuestId ?? undefined);
      setCart(nextCart);
    } finally {
      setIsLoading(false);
    }
  }, [activeGuestId, activeUserId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated && !guestId) {
      return;
    }

    void refreshCart();
  }, [guestId, isAuthLoading, isAuthenticated, refreshCart]);

  const mergeGuestCartIntoUser = useCallback(async () => {
    if (!activeUserId || !guestId) {
      return;
    }

    if (mergedForUserRef.current === activeUserId) {
      return;
    }

    setIsLoading(true);
    try {
      const [guestCart, userCart] = await Promise.all([
        getCart(undefined, guestId),
        getCart(activeUserId, undefined),
      ]);

      if (!guestCart || guestCart.items.length === 0) {
        mergedForUserRef.current = activeUserId;
        return;
      }

      const mergedItems = mergeMutationItems(
        toMutationItems(userCart?.items ?? []),
        toMutationItems(guestCart.items),
      );

      if (mergedItems.length > 0) {
        if (userCart) {
          await updateCart(userCart.id, mergedItems, undefined, storeId);
        } else {
          await createCart(mergedItems, undefined, storeId);
        }
      }

      await removeCartDocument(guestCart.id, guestId, storeId);
      mergedForUserRef.current = activeUserId;
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, guestId, refreshCart, storeId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !activeUserId) {
      return;
    }

    void mergeGuestCartIntoUser();
  }, [activeUserId, isAuthLoading, isAuthenticated, mergeGuestCartIntoUser]);

  const persistItems = useCallback(
    async (nextItems: CartMutationItem[]) => {
      if (!activeUserId && !activeGuestId) {
        return;
      }
      if (features.multiStore && !storeId && nextItems.length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        if (nextItems.length === 0) {
          if (cart?.id) {
            await removeCartDocument(cart.id, activeGuestId ?? undefined, storeId);
          }
          setCart(null);
          return;
        }

        const savedCart = cart?.id
          ? await updateCart(cart.id, nextItems, activeGuestId ?? undefined, storeId)
          : await createCart(nextItems, activeGuestId ?? undefined, storeId);

        setCart(savedCart);
        await refreshCart();
      } finally {
        setIsLoading(false);
      }
    },
    [activeGuestId, activeUserId, cart?.id, refreshCart, storeId],
  );

  const addItem = useCallback(
    async (productId: string, variantId?: string, quantity = 1) => {
      if (features.multiStore && !storeId) {
        return;
      }
      const safeQuantity = Math.max(1, quantity);
      const nextItems = toMutationItems(items);
      const key = cartItemKey(productId, variantId ?? null);
      const index = nextItems.findIndex(
        (item) => cartItemKey(item.product, item.variant ?? null) === key,
      );

      if (index >= 0) {
        nextItems[index] = {
          ...nextItems[index],
          quantity: nextItems[index].quantity + safeQuantity,
        };
      } else {
        nextItems.push({
          product: productId,
          variant: variantId,
          quantity: safeQuantity,
        });
      }

      await persistItems(nextItems);
    },
    [items, persistItems, storeId],
  );

  const updateQuantity = useCallback(
    async (productId: string, variantId: string | null, quantity: number) => {
      const key = cartItemKey(productId, variantId);
      const nextItems = toMutationItems(items)
        .map((item) =>
          cartItemKey(item.product, item.variant ?? null) === key
            ? { ...item, quantity }
            : item,
        )
        .filter((item) => item.quantity > 0);

      await persistItems(nextItems);
    },
    [items, persistItems],
  );

  const removeItem = useCallback(
    async (productId: string, variantId: string | null) => {
      const key = cartItemKey(productId, variantId);
      const nextItems = toMutationItems(items).filter(
        (item) => cartItemKey(item.product, item.variant ?? null) !== key,
      );

      await persistItems(nextItems);
    },
    [items, persistItems],
  );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (cart?.id) {
        await removeCartDocument(cart.id, activeGuestId ?? undefined, storeId);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeGuestId, cart?.id, storeId]);

  const applyCouponCode = useCallback(
    async (code: string) => {
      if (!cart?.id) {
        return;
      }
      setIsLoading(true);
      try {
        const next = await patchCartCoupon(cart.id, code.trim(), activeGuestId ?? undefined);
        setCart(next);
      } finally {
        setIsLoading(false);
      }
    },
    [cart?.id, activeGuestId],
  );

  const removeCoupon = useCallback(async () => {
    if (!cart?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const next = await clearCartCoupon(cart.id, activeGuestId ?? undefined);
      setCart(next);
    } finally {
      setIsLoading(false);
    }
  }, [cart?.id, activeGuestId]);

  const saveCustomerNote = useCallback(
    async (note: string) => {
      if (!cart?.id) {
        return;
      }
      /* Notes PATCH must not toggle global isLoading — that disables cart inputs mid-typing. */
      const updated = await patchCartCustomerNote(
        cart.id,
        note,
        activeGuestId ?? undefined,
      );
      setCart(updated);
    },
    [cart?.id, activeGuestId],
  );

  const value = useMemo<CartContextType>(
    () => ({
      cartId: cart?.id ?? null,
      customerNote,
      items,
      itemCount,
      subtotal,
      discountTotal,
      appliedCouponCode,
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      applyCouponCode,
      removeCoupon,
      saveCustomerNote,
    }),
    [
      addItem,
      appliedCouponCode,
      applyCouponCode,
      cart?.id,
      clearCart,
      customerNote,
      discountTotal,
      isLoading,
      itemCount,
      items,
      refreshCart,
      removeCoupon,
      removeItem,
      saveCustomerNote,
      subtotal,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
