import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { recalculateProductRating } from "@/lib/reviews";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  adminReply: z.string().trim().max(2000).optional(),
});

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  await prisma.review.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.adminReply !== undefined ? { adminReply: parsed.data.adminReply || null } : {}),
    },
  });

  if (parsed.data.status) {
    await recalculateProductRating(review.productId);
  }

  return NextResponse.json({ message: "Avis mis à jour." });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  await prisma.review.delete({ where: { id: params.id } });
  await recalculateProductRating(review.productId);

  return NextResponse.json({ message: "Avis supprimé." });
}
