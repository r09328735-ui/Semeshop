import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { taxRateSchema } from "@/lib/validations/settings";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = taxRateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const taxRate = await prisma.taxRate.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      state: parsed.data.state || null,
      rate: parsed.data.rate,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ taxRate });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.taxRate.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Taxe supprimée." });
}
