import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";

interface RouteParams {
  params: { orderNumber: string };
}

export async function GET(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: { items: true, shippingAddress: true, user: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const storeSettings = await prisma.storeSettings.findFirst();

  const pdfBytes = await generateInvoicePdf({
    storeName: storeSettings?.name ?? "SemevoShop",
    storePhone: storeSettings?.whatsappNumber ?? null,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.user.name ?? "Client",
    customerEmail: order.user.email,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    },
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    taxAmount: Number(order.taxAmount),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${order.orderNumber}.pdf"`,
    },
  });
}
