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
import { createCart, deleteCart, getCart, updateCart } from "@/lib/api/cart";
import { useAuth } from "@/lib/hooks/use-auth";
import { useGuestId } from "@/lib/hooks/use-guest-id";
import type { Cart, CartItem } from "@/lib/types/cart";

export type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
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
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mergedForUserRef = useRef<string | null>(null);

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal =
    typeof cart?.subtotal === "number"
      ? cart.subtotal
      : items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

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
          await updateCart(userCart.id, mergedItems, undefined);
        } else {
          await createCart(mergedItems, undefined);
        }
      }

      await deleteCart(guestCart.id, guestId);
      mergedForUserRef.current = activeUserId;
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, guestId, refreshCart]);

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

      setIsLoading(true);
      try {
        if (nextItems.length === 0) {
          if (cart?.id) {
            await deleteCart(cart.id, activeGuestId ?? undefined);
          }
          setCart(null);
          return;
        }

        const savedCart = cart?.id
          ? await updateCart(cart.id, nextItems, activeGuestId ?? undefined)
          : await createCart(nextItems, activeGuestId ?? undefined);

        setCart(savedCart);
        await refreshCart();
      } finally {
        setIsLoading(false);
      }
    },
    [activeGuestId, activeUserId, cart?.id, refreshCart],
  );

  const addItem = useCallback(
    async (productId: string, variantId?: string, quantity = 1) => {
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
    [items, persistItems],
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
        await deleteCart(cart.id, activeGuestId ?? undefined);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeGuestId, cart?.id]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      itemCount,
      subtotal,
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
    }),
    [
      addItem,
      clearCart,
      isLoading,
      itemCount,
      items,
      refreshCart,
      removeItem,
      subtotal,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
