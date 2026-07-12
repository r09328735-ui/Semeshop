import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { deleteImage } from "@/lib/media";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

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
    prisma.product.findFirst({ where: { slug: data.slug, id: { not: params.id } } }),
    prisma.product.findFirst({ where: { sku: data.sku, id: { not: params.id } } }),
  ]);
  if (slugExists) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  if (skuExists) return NextResponse.json({ error: "Ce SKU est déjà utilisé." }, { status: 409 });

  const removedImageUrls = existing.images
    .map((image) => image.url)
    .filter((url) => !data.images.some((image) => image.url === url));

  const totalStock =
    data.variants.length > 0 ? data.variants.reduce((sum, v) => sum + v.stock, 0) : data.stock;

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: params.id } }),
    prisma.productVariant.deleteMany({ where: { productId: params.id } }),
    prisma.productCategory.deleteMany({ where: { productId: params.id } }),
    prisma.product.update({
      where: { id: params.id },
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
    }),
  ]);

  await Promise.all(removedImageUrls.map((url) => deleteImage(url)));

  return NextResponse.json({ message: "Produit mis à jour." });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  const orderItemCount = await prisma.orderItem.count({ where: { productId: params.id } });
  if (orderItemCount > 0) {
    return NextResponse.json(
      { error: "Ce produit fait partie de commandes existantes et ne peut pas être supprimé. Archivez-le plutôt." },
      { status: 400 }
    );
  }

  await prisma.product.delete({ where: { id: params.id } });
  await Promise.all(product.images.map((image) => deleteImage(image.url)));

  return NextResponse.json({ message: "Produit supprimé." });
}
