import { ProductCard, type ProductCardData } from "@/components/site/product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }): JSX.Element {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Aucun produit trouvé.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
