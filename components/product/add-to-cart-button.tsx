"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ProductVariantOption {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  priceModifier: number;
}

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  basePrice: number;
  baseStock: number;
  variants: ProductVariantOption[];
}

export function AddToCartButton({
  productId,
  slug,
  name,
  image,
  basePrice,
  baseStock,
  variants,
}: AddToCartButtonProps): JSX.Element {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const hasVariants = variants.length > 0;

  const price = useMemo(
    () => basePrice + (selectedVariant?.priceModifier ?? 0),
    [basePrice, selectedVariant]
  );
  const stock = hasVariants ? selectedVariant?.stock ?? 0 : baseStock;
  const outOfStock = stock <= 0;
  const missingSelection = hasVariants && !selectedVariant;

  function handleAddToCart(): void {
    if (missingSelection) {
      toast.error("Choisissez une variante avant d'ajouter au panier.");
      return;
    }
    const variantLabel = selectedVariant
      ? [selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / ")
      : null;

    addItem({
      productId,
      variantId: selectedVariant?.id ?? null,
      name,
      slug,
      image,
      price,
      quantity,
      stock,
      variantLabel,
    });
    toast.success("Ajouté au panier.");
  }

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <Label className="mb-2 block">Choisir une variante</Label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const label = [variant.size, variant.color].filter(Boolean).join(" / ") || "Standard";
              const disabled = variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    selectedVariantId === variant.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent",
                    disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {label}
                  {disabled && " (épuisé)"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-2xl font-semibold">{formatPrice(price)}</div>

      {outOfStock ? (
        <p className="text-sm font-medium text-destructive">Produit en rupture de stock.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {stock <= 5 ? `Plus que ${stock} en stock` : "En stock"}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="flex-1"
          size="lg"
          onClick={handleAddToCart}
          disabled={outOfStock || missingSelection}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
}
