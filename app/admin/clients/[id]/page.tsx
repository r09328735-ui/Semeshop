import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { StarRating } from "@/components/shared/star-rating";
import { CustomerActions } from "@/components/admin/customer-actions";

export const metadata: Metadata = { title: "Fiche client — Admin" };
export const dynamic = "force-dynamic";

interface CustomerDetailPageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps): Promise<JSX.Element> {
  const customer = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
      reviews: { include: { product: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer || customer.role !== "USER") notFound();

  const totalSpent = customer.orders
    .filter((order) => !["CANCELLED"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.email} · Inscrit le {formatDate(customer.createdAt)}
          </p>
        </div>
        <Badge variant={customer.isActive ? "success" : "destructive"}>
          {customer.isActive ? "Actif" : "Désactivé"}
        </Badge>
      </div>

      <CustomerActions customerId={customer.id} isActive={customer.isActive} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-2xl font-semibold">{customer.orders.length}</p>
          <p className="text-sm text-muted-foreground">Commande(s)</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-2xl font-semibold">{formatPrice(totalSpent)}</p>
          <p className="text-sm text-muted-foreground">Total dépensé</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-2xl font-semibold">{customer.reviews.length}</p>
          <p className="text-sm text-muted-foreground">Avis laissés</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Historique des commandes</h3>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune commande.</p>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/commandes/${order.orderNumber}`}
                  className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
                >
                  <span>
                    {order.orderNumber} · {formatDate(order.createdAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    {formatPrice(order.total)}
                    <OrderStatusBadge status={order.status} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Adresses</h3>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune adresse enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {customer.addresses.map((address) => (
                <div key={address.id} className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{address.fullName}</p>
                  {address.line1}, {address.postalCode} {address.city}, {address.country}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Avis laissés</h3>
        {customer.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun avis laissé.</p>
        ) : (
          <div className="space-y-3">
            {customer.reviews.map((review) => (
              <div key={review.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{review.product.name}</p>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
