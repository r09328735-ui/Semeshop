import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

export async function POST(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const source = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, categories: true },
  });
  if (!source) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  const suffix = uniqueSuffix();

  const duplicate = await prisma.product.create({
    data: {
      name: `${source.name} (copie)`,
      slug: `${source.slug}-copie-${suffix}`,
      description: source.description,
      price: source.price,
      compareAtPrice: source.compareAtPrice,
      sku: `${source.sku}-COPIE-${suffix.toUpperCase()}`,
      stock: source.stock,
      lowStockThreshold: source.lowStockThreshold,
      weight: source.weight,
      length: source.length,
      width: source.width,
      height: source.height,
      status: "DRAFT",
      isFeatured: false,
      categories: { create: source.categories.map((c) => ({ categoryId: c.categoryId })) },
      images: {
        create: source.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          position: image.position,
          isMain: image.isMain,
        })),
      },
      variants: {
        create: source.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          sku: `${variant.sku}-COPIE-${suffix.toUpperCase()}`,
          stock: variant.stock,
          priceModifier: variant.priceModifier,
        })),
      },
    },
  });

  return NextResponse.json({ product: duplicate }, { status: 201 });
}
