import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { shippingZoneSchema } from "@/lib/validations/settings";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = shippingZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const zone = await prisma.shippingZone.update({
    where: { id: params.id },
    data: { name: parsed.data.name, countries: parsed.data.countries },
  });

  return NextResponse.json({ zone });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const methodCount = await prisma.shippingMethod.count({ where: { shippingZoneId: params.id } });
  if (methodCount > 0) {
    return NextResponse.json(
      { error: "Supprimez d'abord les modes de livraison de cette zone." },
      { status: 400 }
    );
  }

  await prisma.shippingZone.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Zone supprimée." });
}
