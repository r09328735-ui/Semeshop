import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceCart, generateOrderNumber } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/validations/order";
import { addressSchema } from "@/lib/validations/address";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vous devez être connecté pour commander." }, { status: 401 });
  }

  const { success } = await rateLimit(`checkout:${session.user.id}`, { limit: 10, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans un instant." }, { status: 429 });
  }

  const body: unknown = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données de commande invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const userId = session.user.id;

  // Resolve shipping address (existing address owned by the user, or a new one).
  let shippingAddressId = data.shippingAddressId ?? null;
  if (!shippingAddressId && data.newShippingAddress) {
    const parsedAddress = addressSchema.safeParse({ ...data.newShippingAddress, type: "SHIPPING" });
    if (!parsedAddress.success) {
      return NextResponse.json({ error: "Adresse de livraison invalide." }, { status: 400 });
    }
    const created = await prisma.address.create({ data: { ...parsedAddress.data, userId } });
    shippingAddressId = created.id;
  } else if (shippingAddressId) {
    const address = await prisma.address.findFirst({ where: { id: shippingAddressId, userId } });
    if (!address) {
      return NextResponse.json({ error: "Adresse de livraison introuvable." }, { status: 400 });
    }
  }

  if (!shippingAddressId) {
    return NextResponse.json({ error: "Adresse de livraison requise." }, { status: 400 });
  }

  // Resolve billing address.
  let billingAddressId = shippingAddressId;
  if (!data.billingSameAsShipping) {
    if (data.billingAddressId) {
      const address = await prisma.address.findFirst({ where: { id: data.billingAddressId, userId } });
      if (!address) {
        return NextResponse.json({ error: "Adresse de facturation introuvable." }, { status: 400 });
      }
      billingAddressId = data.billingAddressId;
    } else if (data.newBillingAddress) {
      const parsedAddress = addressSchema.safeParse({ ...data.newBillingAddress, type: "BILLING" });
      if (!parsedAddress.success) {
        return NextResponse.json({ error: "Adresse de facturation invalide." }, { status: 400 });
      }
      const created = await prisma.address.create({ data: { ...parsedAddress.data, userId } });
      billingAddressId = created.id;
    } else {
      return NextResponse.json({ error: "Adresse de facturation requise." }, { status: 400 });
    }
  }

  const shippingAddress = await prisma.address.findUniqueOrThrow({ where: { id: shippingAddressId } });

  const priced = await priceCart(data.items, {
    couponCode: data.couponCode,
    shippingMethodId: data.shippingMethodId,
    country: shippingAddress.country,
  });

  if (priced.errors.length > 0) {
    return NextResponse.json({ error: priced.errors[0], details: priced.errors }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();

  // Paiement à la livraison : la commande est confirmée immédiatement (pas
  // d'étape de paiement en ligne à attendre) et le stock est décrémenté tout
  // de suite pour refléter la réservation des articles. Le tout est exécuté
  // dans une transaction pour éviter une commande créée sans que le stock
  // n'ait été mis à jour.
  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "CONFIRMED",
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING",
        subtotal: priced.subtotal,
        shippingCost: priced.shippingCost,
        taxAmount: priced.taxAmount,
        discountAmount: priced.discountAmount,
        total: priced.total,
        couponId: priced.coupon?.id,
        shippingAddressId,
        billingAddressId,
        shippingMethodId: priced.shippingMethod?.id,
        items: {
          create: priced.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            name: line.name,
            image: line.image,
            sku: line.sku,
            price: line.price,
            quantity: line.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: "CONFIRMED",
            note: "Commande confirmée. Paiement à la livraison.",
          },
        },
      },
    });

    if (priced.coupon) {
      await tx.coupon.update({
        where: { id: priced.coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    for (const line of priced.lines) {
      if (line.variantId) {
        await tx.productVariant.update({
          where: { id: line.variantId },
          data: { stock: { decrement: line.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }
      await tx.product.update({
        where: { id: line.productId },
        data: { salesCount: { increment: line.quantity } },
      });
    }
  });

  return NextResponse.json({ orderNumber });
}
