"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Minus, Plus, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuoteResponse {
  subtotal: number;
  discountAmount: number;
  total: number;
  errors: string[];
}

export function CartPageContent(): JSX.Element {
  const router = useRouter();
  const { status } = useSession();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      return;
    }
    setIsQuoting(true);
    fetch("/api/orders/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponCode: couponCode || null,
      }),
    })
      .then((res) => res.json() as Promise<QuoteResponse>)
      .then((data) => {
        setQuote(data);
        setCouponError(couponCode && data.discountAmount === 0 && data.errors.length > 0 ? data.errors[0] ?? null : null);
      })
      .catch(() => undefined)
      .finally(() => setIsQuoting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, JSON.stringify(items.map((i) => [i.key, i.quantity])), couponCode]);

  function handleCheckout(): void {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/commande");
      return;
    }
    router.push("/commande");
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Votre panier est vide</h1>
        <Button asChild>
          <Link href="/produits">Découvrir nos produits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Mon panier</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 rounded-lg border p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/produits/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
                  )}
                  {item.quantity >= item.stock && (
                    <p className="text-xs font-medium text-amber-600">Stock maximum atteint</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 self-start text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.key)}
                aria-label="Retirer du panier"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="h-fit space-y-4 rounded-lg border p-6">
          <h2 className="font-semibold">Récapitulatif</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Code promo"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            />
          </div>
          {couponError && <p className="text-sm text-destructive">{couponError}</p>}
          {!couponError && couponCode && quote && quote.discountAmount > 0 && (
            <p className="text-sm text-emerald-600">Code promo appliqué !</p>
          )}

          <div className="space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(quote?.subtotal ?? subtotal)}</span>
            </div>
            {quote && quote.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise</span>
                <span>-{formatPrice(quote.discountAmount)}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Livraison et taxes calculées à l&apos;étape suivante.
            </p>
          </div>

          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isQuoting}>
            {isQuoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Passer la commande
          </Button>
        </div>
      </div>
    </div>
  );
}
