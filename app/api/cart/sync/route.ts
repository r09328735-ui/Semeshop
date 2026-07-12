import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const syncSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().nullable(),
      quantity: z.number().int().min(1).max(99),
    })
  ),
});

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const userId = session.user.id;

  for (const item of parsed.data.items) {
    const [product, variant] = await Promise.all([
      prisma.product.findUnique({ where: { id: item.productId }, select: { stock: true } }),
      item.variantId
        ? prisma.productVariant.findUnique({ where: { id: item.variantId }, select: { stock: true } })
        : Promise.resolve(null),
    ]);
    const availableStock = variant?.stock ?? product?.stock ?? 0;
    if (availableStock <= 0) continue;

    // Prisma compound unique lookups don't accept null for a nullable column,
    // so we look the row up manually instead of using findUnique here.
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId: item.productId, variantId: item.variantId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + item.quantity, availableStock) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: Math.min(item.quantity, availableStock),
        },
      });
    }
  }

  const dbItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      variant: true,
    },
  });

  const merged = dbItems
    .filter((line) => line.product.status === "PUBLISHED")
    .map((line) => {
      const price = Number(line.product.price) + (line.variant ? Number(line.variant.priceModifier) : 0);
      const stock = line.variant ? line.variant.stock : line.product.stock;
      const variantLabel = line.variant
        ? [line.variant.size, line.variant.color].filter(Boolean).join(" / ")
        : null;
      return {
        key: line.variantId ? `${line.productId}:${line.variantId}` : line.productId,
        productId: line.productId,
        variantId: line.variantId,
        name: line.product.name,
        slug: line.product.slug,
        image: line.product.images[0]?.url ?? null,
        price,
        quantity: Math.min(line.quantity, stock || 0),
        stock,
        variantLabel,
      };
    });

  return NextResponse.json({ items: merged });
}
