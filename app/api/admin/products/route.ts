import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const [slugExists, skuExists] = await Promise.all([
    prisma.product.findUnique({ where: { slug: data.slug } }),
    prisma.product.findUnique({ where: { sku: data.sku } }),
  ]);
  if (slugExists) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  if (skuExists) return NextResponse.json({ error: "Ce SKU est déjà utilisé." }, { status: 409 });

  const totalStock =
    data.variants.length > 0 ? data.variants.reduce((sum, v) => sum + v.stock, 0) : data.stock;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      sku: data.sku,
      stock: totalStock,
      lowStockThreshold: data.lowStockThreshold,
      weight: data.weight ?? null,
      length: data.length ?? null,
      width: data.width ?? null,
      height: data.height ?? null,
      status: data.status,
      isFeatured: data.isFeatured,
      categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
      images: {
        create: data.images.map((image, index) => ({
          url: image.url,
          alt: image.alt || data.name,
          position: index,
          isMain: image.isMain,
        })),
      },
      variants: { create: data.variants },
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
