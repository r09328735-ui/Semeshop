"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
  hasVariants: boolean;
}

export function WishlistGrid({ initialProducts }: { initialProducts: WishlistProduct[] }): JSX.Element {
  const [products, setProducts] = useState(initialProducts);
  const addItem = useCartStore((state) => state.addItem);

  async function handleRemove(productId: string): Promise<void> {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await fetch(`/api/account/wishlist/${productId}`, { method: "DELETE" });
    toast.success("Retiré de la liste de souhaits.");
  }

  function handleAddToCart(product: WishlistProduct): void {
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      variantLabel: null,
    });
    toast.success("Ajouté au panier.");
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        <Heart className="h-10 w-10" />
        <p>Votre liste de souhaits est vide.</p>
        <Button asChild size="sm">
          <Link href="/produits">Découvrir la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="flex flex-col overflow-hidden rounded-lg border">
          <Link href={`/produits/${product.slug}`} className="relative aspect-square w-full bg-muted">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            )}
          </Link>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <Link href={`/produits/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
              {product.name}
            </Link>
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            <div className="mt-auto flex flex-col gap-2">
              {product.hasVariants ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/produits/${product.slug}`}>Voir le produit</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  {product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemove(product.id)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Retirer
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
