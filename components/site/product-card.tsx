import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { StarRating } from "@/components/shared/star-rating";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { Badge } from "@/components/ui/badge";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  avgRating: number;
  reviewCount: number;
  stock: number;
}

export function ProductCard({ product }: { product: ProductCardData }): JSX.Element {
  const outOfStock = product.stock <= 0;
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Pas d&apos;image
          </div>
        )}
        {onSale && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Promo
          </Badge>
        )}
        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} />
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="secondary">Rupture de stock</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.avgRating} size={12} />
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-semibold text-foreground">{formatPrice(product.price)}</span>
          {onSale && product.compareAtPrice !== null && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
