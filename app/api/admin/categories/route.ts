import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

export async function GET(): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existingSlug = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const maxPosition = await prisma.category.aggregate({
    where: { parentId: parsed.data.parentId || null },
    _max: { position: true },
  });

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
