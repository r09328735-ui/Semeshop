import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/mappers";
import { ProductGrid } from "@/components/site/product-grid";
import { SortSelect } from "@/components/site/sort-select";
import { Pagination } from "@/components/site/pagination";

const PAGE_SIZE = 12;

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { tri?: string; page?: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Découvrez notre sélection ${category.name}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps): Promise<JSX.Element> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);

  let orderBy: { price: "asc" | "desc" } | { salesCount: "desc" } | { createdAt: "desc" } = {
    createdAt: "desc",
  };
  if (searchParams.tri === "prix-asc") orderBy = { price: "asc" };
  else if (searchParams.tri === "prix-desc") orderBy = { price: "desc" };
  else if (searchParams.tri === "popularite") orderBy = { salesCount: "desc" };

  const where = {
    status: "PUBLISHED" as const,
    categories: { some: { categoryId: category.id } },
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container py-8">
      <h1 className="mb-2 text-2xl font-semibold">{category.name}</h1>
      {category.description && <p className="mb-6 max-w-2xl text-muted-foreground">{category.description}</p>}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} produit(s)</p>
        <SortSelect />
      </div>
      <ProductGrid products={products.map(toProductCard)} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
