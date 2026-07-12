import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";

export const metadata: Metadata = { title: "Commandes — Admin" };
export const dynamic = "force-dynamic";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

interface AdminOrdersPageProps {
  searchParams: { q?: string; statut?: string; de?: string; a?: string };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps): Promise<JSX.Element> {
  const where: Prisma.OrderWhereInput = {};

  if (searchParams.q) {
    where.OR = [
      { orderNumber: { contains: searchParams.q, mode: "insensitive" } },
      { user: { email: { contains: searchParams.q, mode: "insensitive" } } },
      { user: { name: { contains: searchParams.q, mode: "insensitive" } } },
    ];
  }
  if (searchParams.statut && ALL_STATUSES.includes(searchParams.statut as OrderStatus)) {
    where.status = searchParams.statut as OrderStatus;
  }
  if (searchParams.de || searchParams.a) {
    where.createdAt = {
      ...(searchParams.de ? { gte: new Date(searchParams.de) } : {}),
      ...(searchParams.a ? { lte: new Date(`${searchParams.a}T23:59:59`) } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Commandes</h1>

      <form className="flex flex-wrap gap-2" method="get">
        <Input name="q" placeholder="N° commande, nom, email" defaultValue={searchParams.q} className="max-w-xs" />
        <select
          name="statut"
          defaultValue={searchParams.statut ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tous statuts</option>
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Input type="date" name="de" defaultValue={searchParams.de} className="w-auto" />
        <Input type="date" name="a" defaultValue={searchParams.a} className="w-auto" />
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Commande</th>
              <th className="p-3">Client</th>
              <th className="p-3">Date</th>
              <th className="p-3">Articles</th>
              <th className="p-3">Total</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-accent/50">
                <td className="p-3">
                  <Link href={`/admin/commandes/${order.orderNumber}`} className="font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  <p>{order.user.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td className="p-3">{order.items.length}</td>
                <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                <td className="p-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucune commande trouvée.</p>}
      </div>
    </div>
  );
}
