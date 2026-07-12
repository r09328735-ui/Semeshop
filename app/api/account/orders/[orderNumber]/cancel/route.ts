import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

interface RouteParams {
  params: { orderNumber: string };
}

export async function POST(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: "Cette commande ne peut plus être annulée car elle est déjà expédiée ou livrée." },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "CANCELLED", note: "Commande annulée par le client." },
    });
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
  });

  return NextResponse.json({ message: "Commande annulée." });
}
