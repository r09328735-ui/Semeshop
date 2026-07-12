import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Prisma, ProductStatus } from "@prisma/client";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Produits — Admin" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

interface AdminProductsPageProps {
  searchParams: { q?: string; categorie?: string; statut?: string; stock?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps): Promise<JSX.Element> {
  const where: Prisma.ProductWhereInput = {};

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { sku: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.categorie) {
    where.categories = { some: { categoryId: searchParams.categorie } };
  }
  const validStatuses: ProductStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  if (searchParams.statut && validStatuses.includes(searchParams.statut as ProductStatus)) {
    where.status = searchParams.statut as ProductStatus;
  }
  if (searchParams.stock === "rupture") {
    where.stock = { lte: 0 };
  } else if (searchParams.stock === "faible") {
    where.stock = { gt: 0 };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const filteredByLowStock =
    searchParams.stock === "faible" ? products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold) : products;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <Button asChild>
          <Link href="/admin/produits/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <Input name="q" placeholder="Rechercher (nom, SKU)" defaultValue={searchParams.q} className="max-w-xs" />
        <select
          name="categorie"
          defaultValue={searchParams.categorie ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="statut"
          defaultValue={searchParams.statut ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <select
          name="stock"
          defaultValue={searchParams.stock ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tout stock</option>
          <option value="faible">Stock faible</option>
          <option value="rupture">Rupture de stock</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Produit</th>
              <th className="p-3">Catégories</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredByLowStock.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-accent/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {product.images[0] && (
                        <Image src={product.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {product.categories.map((c) => c.category.name).join(", ") || "—"}
                </td>
                <td className="p-3">{formatPrice(product.price)}</td>
                <td className="p-3">
                  <Badge variant={product.stock === 0 ? "destructive" : product.stock <= product.lowStockThreshold ? "secondary" : "outline"}>
                    {product.stock}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={product.status === "PUBLISHED" ? "success" : "secondary"}>
                    {STATUS_LABEL[product.status]}
                  </Badge>
                </td>
                <td className="p-3">
                  <ProductRowActions productId={product.id} productName={product.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredByLowStock.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}
