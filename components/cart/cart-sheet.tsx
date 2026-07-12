"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

export function CartSheet(): JSX.Element {
  const [open, setOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Panier">
          <ShoppingBag className="h-5 w-5" />
          {totalQuantity > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {totalQuantity}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Mon panier ({totalQuantity})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <p>Votre panier est vide.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/produits/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <span className="text-xs text-muted-foreground">{item.variantLabel}</span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.key)}
                    aria-label="Retirer du panier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <SheetFooter className="flex-col gap-3 border-t pt-4 sm:flex-col">
              <div className="flex w-full items-center justify-between text-sm font-medium">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link href="/panier">Voir le panier</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/commande">Commander</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
