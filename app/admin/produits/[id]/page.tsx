import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Modifier le produit — Admin" };
export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<JSX.Element> {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        categories: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modifier {product.name}</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          weight: product.weight,
          length: product.length,
          width: product.width,
          height: product.height,
          status: product.status,
          isFeatured: product.isFeatured,
          categoryIds: product.categories.map((c) => c.categoryId),
          images: product.images.map((image) => ({
            key: image.id,
            url: image.url,
            alt: image.alt ?? "",
            isMain: image.isMain,
          })),
          variants: product.variants.map((variant) => ({
            key: variant.id,
            size: variant.size ?? "",
            color: variant.color ?? "",
            sku: variant.sku,
            stock: variant.stock,
            priceModifier: variant.priceModifier,
          })),
        }}
      />
    </div>
  );
}
