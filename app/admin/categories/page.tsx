import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Catégories — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage(): Promise<JSX.Element> {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Catégories</h1>
        <p className="text-sm text-muted-foreground">
          Organisez votre catalogue en catégories, avec sous-catégories si besoin.
        </p>
      </div>
      <CategoryManager
        initialCategories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          position: category.position,
          productCount: category._count.products,
          childCount: category._count.children,
        }))}
      />
    </div>
  );
}
