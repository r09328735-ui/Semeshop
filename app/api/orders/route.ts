import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { priceCart, generateOrderNumber } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/validations/order";
import { addressSchema } from "@/lib/validations/address";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vous devez être connecté pour commander." }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Le paiement n'est pas configuré. Contactez l'administrateur." },
      { status: 503 }
    );
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

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
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
      statusHistory: { create: { status: "PENDING", note: "Commande créée, en attente de paiement." } },
    },
  });

  if (priced.coupon) {
    await prisma.coupon.update({
      where: { id: priced.coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(priced.total * 100),
            product_data: { name: `Commande ${orderNumber}` },
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id, orderNumber },
      success_url: `${appUrl}/commande/confirmation/${orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/commande?annulee=1`,
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });

    return NextResponse.json({ orderNumber, checkoutUrl: checkoutSession.url });
  } catch (error) {
    // Stripe session creation failed: cancel the order rather than leaving an
    // unpayable PENDING order behind, and let the customer retry checkout.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (priced.coupon) {
      await prisma.coupon.update({ where: { id: priced.coupon.id }, data: { usedCount: { decrement: 1 } } });
    }
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Le paiement n'a pas pu être initialisé. Veuillez réessayer." },
      { status: 502 }
    );
  }
}
