import type { Product, ProductImage } from "@prisma/client";
import type { ProductCardData } from "@/components/site/product-card";

type ProductWithImages = Product & { images: ProductImage[] };

export function toProductCard(product: ProductWithImages): ProductCardData {
  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    image: mainImage?.url ?? null,
    avgRating: Number(product.avgRating),
    reviewCount: product.reviewCount,
    stock: product.stock,
  };
}
