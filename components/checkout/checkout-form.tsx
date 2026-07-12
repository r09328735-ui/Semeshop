"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import type { AddressInput } from "@/lib/validations/address";
import { AddressForm } from "@/components/shared/address-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddressOption {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingMethodOption {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

interface CheckoutFormProps {
  addresses: AddressOption[];
  shippingMethods: ShippingMethodOption[];
}

interface QuoteResponse {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  errors: string[];
}

function formatAddress(address: AddressOption): string {
  return `${address.fullName} — ${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.postalCode} ${address.city}, ${address.country}`;
}

export function CheckoutForm({ addresses, shippingMethods }: CheckoutFormProps): JSX.Element {
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  const [shippingAddressId, setShippingAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [showNewShipping, setShowNewShipping] = useState(addresses.length === 0);
  const [newShippingAddress, setNewShippingAddress] = useState<AddressInput | null>(null);

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressId, setBillingAddressId] = useState<string | null>(null);
  const [showNewBilling, setShowNewBilling] = useState(false);
  const [newBillingAddress, setNewBillingAddress] = useState<AddressInput | null>(null);

  const [shippingMethodId, setShippingMethodId] = useState<string | null>(shippingMethods[0]?.id ?? null);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry =
    addresses.find((a) => a.id === shippingAddressId)?.country ?? newShippingAddress?.country ?? null;

  useEffect(() => {
    if (items.length === 0 || !shippingMethodId) return;
    fetch("/api/orders/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingMethodId,
        couponCode: couponCode || null,
        country: selectedCountry,
      }),
    })
      .then((res) => res.json() as Promise<QuoteResponse>)
      .then(setQuote)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((i) => [i.key, i.quantity])), shippingMethodId, couponCode, selectedCountry]);

  async function handleSubmit(): Promise<void> {
    if (!shippingAddressId && !newShippingAddress) {
      toast.error("Choisissez ou renseignez une adresse de livraison.");
      return;
    }
    if (!billingSameAsShipping && !billingAddressId && !newBillingAddress) {
      toast.error("Choisissez ou renseignez une adresse de facturation.");
      return;
    }
    if (!shippingMethodId) {
      toast.error("Choisissez un mode de livraison.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddressId: shippingAddressId ?? undefined,
          newShippingAddress: newShippingAddress ?? undefined,
          billingSameAsShipping,
          billingAddressId: billingAddressId ?? undefined,
          newBillingAddress: newBillingAddress ?? undefined,
          shippingMethodId,
          couponCode: couponCode || null,
        }),
      });

      const payload = (await res.json()) as { orderNumber?: string; error?: string };

      if (!res.ok || !payload.orderNumber) {
        toast.error(payload.error ?? "Impossible de créer la commande.");
        return;
      }

      router.push(`/commande/confirmation/${payload.orderNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Votre panier est vide. <Button variant="link" onClick={() => router.push("/produits")}>Voir les produits</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">1. Adresse de livraison</h2>
          <div className="space-y-2">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm",
                  shippingAddressId === address.id && !showNewShipping && "border-primary bg-accent"
                )}
              >
                <input
                  type="radio"
                  name="shippingAddress"
                  className="mt-1"
                  checked={shippingAddressId === address.id && !showNewShipping}
                  onChange={() => {
                    setShippingAddressId(address.id);
                    setShowNewShipping(false);
                    setNewShippingAddress(null);
                  }}
                />
                <span>{formatAddress(address)}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setShowNewShipping((v) => !v)}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {showNewShipping ? "Utiliser une adresse existante" : "+ Ajouter une nouvelle adresse"}
            </button>
            {showNewShipping &&
              (newShippingAddress ? (
                <div className="rounded-md border bg-accent p-3 text-sm">
                  Nouvelle adresse : {newShippingAddress.line1}, {newShippingAddress.postalCode}{" "}
                  {newShippingAddress.city}
                  <button
                    type="button"
                    className="ml-2 text-primary underline-offset-4 hover:underline"
                    onClick={() => setNewShippingAddress(null)}
                  >
                    Modifier
                  </button>
                </div>
              ) : (
                <div className="rounded-md border p-4">
                  <AddressForm
                    type="SHIPPING"
                    submitLabel="Utiliser cette adresse"
                    onSubmit={(data) => {
                      setNewShippingAddress(data);
                      setShippingAddressId(null);
                    }}
                  />
                </div>
              ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">2. Adresse de facturation</h2>
          <div className="flex items-center gap-2">
            <Checkbox
              id="billing-same"
              checked={billingSameAsShipping}
              onCheckedChange={(checked) => setBillingSameAsShipping(Boolean(checked))}
            />
            <Label htmlFor="billing-same" className="cursor-pointer font-normal">
              Identique à l&apos;adresse de livraison
            </Label>
          </div>
          {!billingSameAsShipping && (
            <div className="mt-3 space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm",
                    billingAddressId === address.id && !showNewBilling && "border-primary bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name="billingAddress"
                    className="mt-1"
                    checked={billingAddressId === address.id && !showNewBilling}
                    onChange={() => {
                      setBillingAddressId(address.id);
                      setShowNewBilling(false);
                      setNewBillingAddress(null);
                    }}
                  />
                  <span>{formatAddress(address)}</span>
                </label>
              ))}
              <button
                type="button"
                onClick={() => setShowNewBilling((v) => !v)}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {showNewBilling ? "Utiliser une adresse existante" : "+ Ajouter une nouvelle adresse"}
              </button>
              {showNewBilling &&
                (newBillingAddress ? (
                  <div className="rounded-md border bg-accent p-3 text-sm">
                    Nouvelle adresse : {newBillingAddress.line1}, {newBillingAddress.postalCode}{" "}
                    {newBillingAddress.city}
                    <button
                      type="button"
                      className="ml-2 text-primary underline-offset-4 hover:underline"
                      onClick={() => setNewBillingAddress(null)}
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <div className="rounded-md border p-4">
                    <AddressForm
                      type="BILLING"
                      submitLabel="Utiliser cette adresse"
                      onSubmit={(data) => {
                        setNewBillingAddress(data);
                        setBillingAddressId(null);
                      }}
                    />
                  </div>
                ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">3. Mode de livraison</h2>
          {shippingMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mode de livraison disponible pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm",
                    shippingMethodId === method.id && "border-primary bg-accent"
                  )}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      className="mt-1"
                      checked={shippingMethodId === method.id}
                      onChange={() => setShippingMethodId(method.id)}
                    />
                    <span>
                      <span className="flex items-center gap-1 font-medium">
                        <Truck className="h-4 w-4" /> {method.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {method.description ?? `Livraison en ${method.estimatedDaysMin}-${method.estimatedDaysMax} jours`}
                      </span>
                    </span>
                  </span>
                  <span className="font-medium">{formatPrice(method.cost)}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="h-fit space-y-4 rounded-lg border p-6">
        <h2 className="font-semibold">Récapitulatif</h2>
        <Input
          placeholder="Code promo"
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
        />
        <div className="space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatPrice(quote?.subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Livraison</span>
            <span>{formatPrice(quote?.shippingCost ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>{formatPrice(quote?.taxAmount ?? 0)}</span>
          </div>
          {quote && quote.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Remise</span>
              <span>-{formatPrice(quote.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(quote?.total ?? 0)}</span>
          </div>
        </div>
        {quote && quote.errors.length > 0 && (
          <p className="text-sm text-destructive">{quote.errors[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Paiement en espèces ou par mobile money directement à la livraison. Aucun paiement en
          ligne n&apos;est requis.
        </p>
        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmer la commande (paiement à la livraison)
        </Button>
      </div>
    </div>
  );
}
