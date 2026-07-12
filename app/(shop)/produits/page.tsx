import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/mappers";
import { ProductGrid } from "@/components/site/product-grid";
import { ProductFilters } from "@/components/site/product-filters";
import { SortSelect } from "@/components/site/sort-select";
import { Pagination } from "@/components/site/pagination";

export const metadata: Metadata = {
  title: "Tous les produits",
  description: "Parcourez l'ensemble de notre catalogue de produits.",
};

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: {
    q?: string;
    categorie?: string;
    prixMin?: string;
    prixMax?: string;
    disponibilite?: string;
    note?: string;
    tri?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps): Promise<JSX.Element> {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };

  if (searchParams.q) {
    where.name = { contains: searchParams.q, mode: "insensitive" };
  }
  if (searchParams.categorie) {
    where.categories = { some: { category: { slug: searchParams.categorie } } };
  }
  if (searchParams.prixMin || searchParams.prixMax) {
    where.price = {
      ...(searchParams.prixMin ? { gte: Number(searchParams.prixMin) } : {}),
      ...(searchParams.prixMax ? { lte: Number(searchParams.prixMax) } : {}),
    };
  }
  if (searchParams.disponibilite === "en-stock") {
    where.stock = { gt: 0 };
  }
  if (searchParams.note) {
    where.avgRating = { gte: Number(searchParams.note) };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (searchParams.tri === "prix-asc") orderBy = { price: "asc" };
  else if (searchParams.tri === "prix-desc") orderBy = { price: "desc" };
  else if (searchParams.tri === "popularite") orderBy = { salesCount: "desc" };
  else if (searchParams.tri === "nouveaute") orderBy = { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">
        {searchParams.q ? `Résultats pour "${searchParams.q}"` : "Tous les produits"}
      </h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <ProductFilters categories={categories} />
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{total} produit(s)</p>
            <SortSelect />
          </div>
          <ProductGrid products={products.map(toProductCard)} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
