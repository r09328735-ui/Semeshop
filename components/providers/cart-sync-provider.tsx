"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, type CartLineItem } from "@/store/cart-store";

interface SyncResponse {
  items: CartLineItem[];
}

export function CartSyncProvider(): null {
  const { status } = useSession();
  // Tracks the previous session status so we can detect an actual sign-in
  // transition (unauthenticated -> authenticated) instead of merging the
  // local cart into the server every time an already-authenticated user
  // loads or reloads a page, which would keep adding the same items again.
  const previousStatus = useRef<typeof status | null>(null);

  useEffect(() => {
    const wasUnauthenticated = previousStatus.current === "unauthenticated";
    previousStatus.current = status;

    if (status !== "authenticated" || !wasUnauthenticated) return;

    const localItems = useCartStore.getState().items;
    if (localItems.length === 0) return;

    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: localItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    })
      .then((res) => (res.ok ? (res.json() as Promise<SyncResponse>) : null))
      .then((data) => {
        if (data) {
          useCartStore.getState().replaceCart(data.items);
        }
      })
      .catch(() => undefined);
  }, [status]);

  return null;
}
