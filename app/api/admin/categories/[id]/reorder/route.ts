import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const reorderSchema = z.object({ direction: z.enum(["up", "down"]) });

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Direction invalide." }, { status: 400 });
  }

  const current = await prisma.category.findUnique({ where: { id: params.id } });
  if (!current) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  const siblings = await prisma.category.findMany({
    where: { parentId: current.parentId },
    orderBy: { position: "asc" },
  });

  const index = siblings.findIndex((s) => s.id === current.id);
  const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return NextResponse.json({ message: "Déjà à cette position." });
  }

  const target = siblings[swapIndex]!;

  await prisma.$transaction([
    prisma.category.update({ where: { id: current.id }, data: { position: target.position } }),
    prisma.category.update({ where: { id: target.id }, data: { position: current.position } }),
  ]);

  return NextResponse.json({ message: "Ordre mis à jour." });
}
