import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/mappers";
import { ProductGrid } from "@/components/site/product-grid";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<JSX.Element> {
  const [featured, newArrivals, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      include: { images: { orderBy: { position: "asc" } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { images: { orderBy: { position: "asc" } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { position: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="bg-gradient-to-br from-primary to-primary/80 py-20 text-primary-foreground">
        <div className="container flex flex-col items-start gap-4">
          <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Tout ce qu&apos;il vous faut, livré chez vous.
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Découvrez notre sélection de produits soigneusement choisis, à prix justes, avec une
            livraison rapide et un service client réactif.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-2">
            <Link href="/produits">
              Découvrir la boutique <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container">
          <h2 className="mb-6 text-2xl font-semibold">Catégories populaires</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
              >
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {category.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Produits mis en avant</h2>
            <Link href="/produits" className="text-sm text-muted-foreground hover:text-foreground">
              Voir tout
            </Link>
          </div>
          <ProductGrid products={featured.map(toProductCard)} />
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Nouveautés</h2>
            <Link href="/produits?tri=nouveaute" className="text-sm text-muted-foreground hover:text-foreground">
              Voir tout
            </Link>
          </div>
          <ProductGrid products={newArrivals.map(toProductCard)} />
        </section>
      )}
    </div>
  );
}
