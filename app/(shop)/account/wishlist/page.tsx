import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistGrid } from "@/components/account/wishlist-grid";

export const metadata: Metadata = { title: "Liste de souhaits" };
export const dynamic = "force-dynamic";

export default async function WishlistPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true } },
    },
  });

  const products = items
    .filter((item) => item.product.status === "PUBLISHED")
    .map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      image: item.product.images[0]?.url ?? null,
      stock: item.product.stock,
      hasVariants: item.product.variants.length > 0,
    }));

  return <WishlistGrid initialProducts={products} />;
}
