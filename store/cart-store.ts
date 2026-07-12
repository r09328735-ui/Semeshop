import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLineItem {
  key: string; // productId + variantId
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
  variantLabel: string | null;
}

interface CartState {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartLineItem[]) => void;
  subtotal: () => number;
  totalQuantity: () => number;
}

function makeKey(productId: string, variantId: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const key = makeKey(item.productId, item.variantId);
        set((state) => {
          const existing = state.items.find((line) => line.key === key);
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + item.quantity, existing.stock);
            return {
              items: state.items.map((line) =>
                line.key === key ? { ...line, quantity: nextQuantity } : line
              ),
            };
          }
          return { items: [...state.items, { ...item, key, quantity: Math.min(item.quantity, item.stock) }] };
        });
      },

      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((line) => line.key !== key) }));
      },

      updateQuantity: (key, quantity) => {
        set((state) => ({
          items: state.items.map((line) =>
            line.key === key ? { ...line, quantity: Math.max(1, Math.min(quantity, line.stock)) } : line
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      replaceCart: (items) => set({ items }),

      subtotal: () => get().items.reduce((sum, line) => sum + line.price * line.quantity, 0),

      totalQuantity: () => get().items.reduce((sum, line) => sum + line.quantity, 0),
    }),
    { name: "semeshop-cart" }
  )
);
