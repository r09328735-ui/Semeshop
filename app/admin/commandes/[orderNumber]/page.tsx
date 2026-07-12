import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { InvoiceDownloadButton } from "@/components/shared/invoice-download-button";

export const metadata: Metadata = { title: "Détail commande — Admin" };
export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: { orderNumber: string };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps): Promise<JSX.Element> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      user: true,
      items: true,
      shippingAddress: true,
      billingAddress: true,
      shippingMethod: true,
      coupon: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const storeSettings = await prisma.storeSettings.findFirst();
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${order.user.name ?? ""}, au sujet de votre commande ${order.orderNumber}.`,
    order.user.phone ?? storeSettings?.whatsappNumber ?? undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Passée le {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Articles</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      SKU {item.sku} · Qté {item.quantity}
                    </p>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison ({order.shippingMethod?.name ?? "-"})</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise {order.coupon ? `(${order.coupon.code})` : ""}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <OrderStatusForm
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            currentTrackingNumber={order.trackingNumber}
            currentCarrier={order.carrier}
          />

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
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Client</h3>
            <p className="text-sm">{order.user.name}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
            {order.user.phone && <p className="text-sm text-muted-foreground">{order.user.phone}</p>}
            <Link href={`/admin/clients/${order.user.id}`} className="mt-2 inline-block text-sm underline underline-offset-4">
              Voir la fiche client
            </Link>
          </div>

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

          <div className="flex flex-col gap-2">
            <InvoiceDownloadButton orderNumber={order.orderNumber} scope="admin" />
            <Button asChild variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contacter le client
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
