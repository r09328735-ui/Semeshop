import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalesChart, type SalesDataPoint } from "@/components/admin/sales-chart";

export const metadata: Metadata = { title: "Tableau de bord — Admin" };
export const dynamic = "force-dynamic";

async function getRevenue(since: Date): Promise<{ total: number; count: number }> {
  const result = await prisma.order.aggregate({
    where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    _sum: { total: true },
    _count: true,
  });
  return { total: result._sum.total ?? 0, count: result._count };
}

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(startOfDay);
  thirtyDaysAgo.setDate(startOfDay.getDate() - 29);

  const [dayRevenue, weekRevenue, monthRevenue, yearRevenue, newCustomers, topProducts, lowStockProducts, recentOrders] =
    await Promise.all([
      getRevenue(startOfDay),
      getRevenue(startOfWeek),
      getRevenue(startOfMonth),
      getRevenue(startOfYear),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: startOfMonth } } }),
      prisma.product.findMany({ orderBy: { salesCount: "desc" }, take: 5 }),
      prisma.product.findMany({
        where: { status: "PUBLISHED", stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
        select: { createdAt: true, total: true },
      }),
    ]);

  const chartData: SalesDataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(thirtyDaysAgo);
    day.setDate(thirtyDaysAgo.getDate() + i);
    const dayKey = day.toISOString().slice(0, 10);
    const total = recentOrders
      .filter((order) => order.createdAt.toISOString().slice(0, 10) === dayKey)
      .reduce((sum, order) => sum + order.total, 0);
    chartData.push({
      date: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      total,
    });
  }

  const avgBasketMonth = monthRevenue.count > 0 ? monthRevenue.total / monthRevenue.count : 0;

  const stats = [
    { label: "CA aujourd'hui", value: formatPrice(dayRevenue.total), icon: DollarSign },
    { label: "CA cette semaine", value: formatPrice(weekRevenue.total), icon: DollarSign },
    { label: "CA ce mois", value: formatPrice(monthRevenue.total), icon: DollarSign },
    { label: "CA cette année", value: formatPrice(yearRevenue.total), icon: TrendingUp },
    { label: "Commandes ce mois", value: String(monthRevenue.count), icon: ShoppingBag },
    { label: "Panier moyen (mois)", value: formatPrice(avgBasketMonth), icon: ShoppingBag },
    { label: "Nouveaux clients (mois)", value: String(newCustomers), icon: Users },
    { label: "Produits en rupture", value: String(lowStockProducts.length), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution des ventes (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune vente pour le moment.</p>
            ) : (
              topProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/produits/${product.id}`}
                  className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
                >
                  <span>{product.name}</span>
                  <Badge variant="secondary">{product.salesCount} vendus</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes de stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune alerte de stock.</p>
            ) : (
              lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/produits/${product.id}`}
                  className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
                >
                  <span>{product.name}</span>
                  <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                    {product.stock === 0 ? "Rupture" : `${product.stock} restants`}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
