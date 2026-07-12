import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Package, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

export default async function AccountDashboardPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [user, recentOrders, orderCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bonjour {user?.name ?? "!"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-md border p-4">
            <p className="text-2xl font-semibold">{orderCount}</p>
            <p className="text-sm text-muted-foreground">Commande(s) au total</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes récentes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/orders">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
              <Package className="h-10 w-10" />
              <p>Vous n&apos;avez pas encore passé de commande.</p>
              <Button asChild size="sm">
                <Link href="/produits">Découvrir la boutique</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
