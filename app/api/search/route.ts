import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      name: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
    take: 8,
    orderBy: { salesCount: "desc" },
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0]?.url ?? null,
    })),
  });
}
