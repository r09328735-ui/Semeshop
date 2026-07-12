import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Clients — Admin" };
export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: { q?: string };
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps): Promise<JSX.Element> {
  const where: Prisma.UserWhereInput = { role: "USER" };

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { email: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      <form className="flex gap-2" method="get">
        <Input name="q" placeholder="Rechercher (nom, email)" defaultValue={searchParams.q} className="max-w-xs" />
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Inscrit le</th>
              <th className="p-3">Commandes</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b last:border-0 hover:bg-accent/50">
                <td className="p-3">
                  <Link href={`/admin/clients/${customer.id}`} className="font-medium hover:underline">
                    {customer.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(customer.createdAt)}</td>
                <td className="p-3">{customer._count.orders}</td>
                <td className="p-3">
                  <Badge variant={customer.isActive ? "success" : "destructive"}>
                    {customer.isActive ? "Actif" : "Désactivé"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucun client trouvé.</p>}
      </div>
    </div>
  );
}
