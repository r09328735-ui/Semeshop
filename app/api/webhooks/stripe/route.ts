import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request): Promise<NextResponse> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signature invalide.";
    return NextResponse.json({ error: `Webhook invalide : ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              stripePaymentIntentId:
                typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null,
            },
          }),
          prisma.orderStatusHistory.create({
            data: { orderId: order.id, status: "CONFIRMED", note: "Paiement confirmé par Stripe." },
          }),
          ...order.items.flatMap((item) => [
            item.variantId
              ? prisma.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { decrement: item.quantity } },
                })
              : prisma.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                }),
            prisma.product.update({
              where: { id: item.productId },
              data: { salesCount: { increment: item.quantity } },
            }),
          ]),
        ]);

        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, {
            orderNumber: order.orderNumber,
            customerName: user.name ?? "client",
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            taxAmount: Number(order.taxAmount),
            discountAmount: Number(order.discountAmount),
            total: Number(order.total),
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
