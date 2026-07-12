import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Package } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";

export const metadata: Metadata = { title: "Mes commandes" };
export const dynamic = "force-dynamic";

export default async function OrdersPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        <Package className="h-10 w-10" />
        <p>Vous n&apos;avez pas encore passé de commande.</p>
        <Button asChild size="sm">
          <Link href="/produits">Découvrir la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.orderNumber}`}
          className="flex flex-col gap-2 rounded-md border p-4 hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)} · {order.items.length} article(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formatPrice(Number(order.total))}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
