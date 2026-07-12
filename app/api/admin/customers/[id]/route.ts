import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({ isActive: z.boolean() });

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const customer = await prisma.user.findUnique({ where: { id: params.id } });
  if (!customer || customer.role !== "USER") {
    return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  }

  await prisma.user.update({ where: { id: params.id }, data: { isActive: parsed.data.isActive } });

  return NextResponse.json({ message: parsed.data.isActive ? "Compte réactivé." : "Compte désactivé." });
}
