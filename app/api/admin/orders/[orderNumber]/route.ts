import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validations/order-admin";

interface RouteParams {
  params: { orderNumber: string };
}

const STATUS_NOTES: Record<string, string> = {
  PENDING: "Commande remise en attente.",
  CONFIRMED: "Commande confirmée.",
  PROCESSING: "Commande en préparation.",
  SHIPPED: "Commande expédiée.",
  DELIVERED: "Commande livrée.",
  CANCELLED: "Commande annulée par l'administrateur.",
  REFUNDED: "Commande remboursée.",
};

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { status, trackingNumber, carrier, note } = parsed.data;
  const statusChanged = status !== order.status;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        paymentStatus: status === "DELIVERED" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : order.paymentStatus,
        cancelledAt: status === "CANCELLED" ? new Date() : order.cancelledAt,
      },
    });

    if (statusChanged) {
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status, note: note || STATUS_NOTES[status] },
      });
    }

    // Restock automatically when an order is cancelled or refunded from the
    // admin panel and wasn't already in a state that had released the stock.
    const shouldRestock =
      statusChanged && ["CANCELLED", "REFUNDED"].includes(status) && !["CANCELLED", "REFUNDED"].includes(order.status);

    if (shouldRestock) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { salesCount: { decrement: item.quantity } },
        });
      }
    }
  });

  return NextResponse.json({ message: "Commande mise à jour." });
}
