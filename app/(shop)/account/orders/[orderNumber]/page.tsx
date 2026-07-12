import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Truck, MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { CancelOrderButton } from "@/components/account/cancel-order-button";
import { InvoiceDownloadButton } from "@/components/shared/invoice-download-button";
import { ReviewForm } from "@/components/account/review-form";

export const metadata: Metadata = { title: "Détail de la commande" };
export const dynamic = "force-dynamic";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

interface OrderDetailPageProps {
  params: { orderNumber: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: {
      items: { include: { review: true } },
      shippingAddress: true,
      billingAddress: true,
      shippingMethod: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const storeSettings = await prisma.storeSettings.findFirst();
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour, j'ai une question à propos de ma commande ${order.orderNumber}.`,
    storeSettings?.whatsappNumber ?? undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">Passée le {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.trackingNumber && (
        <div className="flex items-center gap-2 rounded-md border bg-accent p-4 text-sm">
          <Truck className="h-4 w-4" />
          <span>
            Numéro de suivi : <strong>{order.trackingNumber}</strong>
            {order.carrier ? ` (${order.carrier})` : ""}
          </span>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Articles</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qté {item.quantity} · {formatPrice(Number(item.price))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                {order.status === "DELIVERED" &&
                  (item.review ? (
                    <span className="text-sm text-muted-foreground">Avis envoyé</span>
                  ) : (
                    <ReviewForm orderItemId={item.id} productName={item.name} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Adresse de livraison</h3>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}
            <br />
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
            <br />
            {order.shippingAddress.country}
            <br />
            {order.shippingAddress.phone}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Récapitulatif</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison ({order.shippingMethod?.name ?? "-"})</span>
              <span>{formatPrice(Number(order.shippingCost))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span>{formatPrice(Number(order.taxAmount))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise</span>
                <span>-{formatPrice(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <InvoiceDownloadButton orderNumber={order.orderNumber} />
        <Button asChild variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Discuter sur WhatsApp
          </a>
        </Button>
        {CANCELLABLE_STATUSES.includes(order.status) && <CancelOrderButton orderNumber={order.orderNumber} />}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Historique</h3>
        <ul className="space-y-2 text-sm">
          {order.statusHistory.map((entry) => (
            <li key={entry.id} className="flex justify-between text-muted-foreground">
              <span>
                <OrderStatusBadge status={entry.status} /> {entry.note}
              </span>
              <span>{formatDate(entry.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
        ← Retour à mes commandes
      </Link>
    </div>
  );
}
