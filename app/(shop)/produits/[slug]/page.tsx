import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/mappers";
import { sanitizeHtml } from "@/lib/sanitize";
import { ImageGallery } from "@/components/product/image-gallery";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ReviewList } from "@/components/product/review-list";
import { ProductGrid } from "@/components/site/product-grid";
import { StarRating } from "@/components/shared/star-rating";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      categories: { include: { category: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  const description = product.description.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps): Promise<JSX.Element> {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  const session = await getServerSession(authOptions);
  const isWishlisted = session?.user
    ? Boolean(
        await prisma.wishlistItem.findFirst({
          where: { userId: session.user.id, productId: product.id },
        })
      )
    : false;

  const relatedProducts =
    product.categories.length > 0
      ? await prisma.product.findMany({
          where: {
            status: "PUBLISHED",
            id: { not: product.id },
            categories: { some: { categoryId: { in: product.categories.map((c) => c.categoryId) } } },
          },
          include: { images: { orderBy: { position: "asc" } } },
          take: 4,
        })
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.replace(/<[^>]+>/g, "").slice(0, 500),
    image: product.images.map((image) => image.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: Number(product.price),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.avgRating),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="container py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery
          images={product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt }))}
          productName={product.name}
        />

        <div>
          {product.categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {product.categories.map(({ category }) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>
          {product.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={Number(product.avgRating)} />
              <span className="text-sm text-muted-foreground">
                {Number(product.avgRating).toFixed(1)} ({product.reviewCount} avis)
              </span>
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              image={product.images[0]?.url ?? null}
              basePrice={Number(product.price)}
              baseStock={product.stock}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                size: variant.size,
                color: variant.color,
                stock: variant.stock,
                priceModifier: Number(variant.priceModifier),
              }))}
            />
            <div className="mt-3">
              <WishlistButton productId={product.id} initialWishlisted={isWishlisted} variant="full" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="avis">Avis ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="max-w-3xl">
          <div
            className="prose prose-sm max-w-none text-foreground"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
          />
        </TabsContent>
        <TabsContent value="avis" className="max-w-3xl">
          <ReviewList
            reviews={product.reviews.map((review) => ({
              id: review.id,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              images: review.images,
              adminReply: review.adminReply,
              createdAt: review.createdAt,
              userName: review.user.name ?? "Client",
            }))}
          />
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">Produits similaires</h2>
          <ProductGrid products={relatedProducts.map(toProductCard)} />
        </section>
      )}
    </div>
  );
}
