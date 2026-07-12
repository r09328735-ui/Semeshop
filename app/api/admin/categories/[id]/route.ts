import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
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

  if (parsed.data.parentId === params.id) {
    return NextResponse.json({ error: "Une catégorie ne peut pas être son propre parent." }, { status: 400 });
  }

  const existingSlug = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, id: { not: params.id } },
  });
  if (existingSlug) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: params.id } }),
    prisma.productCategory.count({ where: { categoryId: params.id } }),
  ]);

  if (childCount > 0) {
    return NextResponse.json(
      { error: "Supprimez ou déplacez d'abord les sous-catégories." },
      { status: 400 }
    );
  }
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Cette catégorie contient des produits. Retirez-les avant de la supprimer." },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Catégorie supprimée." });
}
