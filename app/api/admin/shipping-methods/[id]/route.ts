import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { shippingMethodSchema } from "@/lib/validations/settings";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = shippingMethodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const method = await prisma.shippingMethod.update({
    where: { id: params.id },
    data: {
      shippingZoneId: parsed.data.shippingZoneId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      cost: parsed.data.cost,
      estimatedDaysMin: parsed.data.estimatedDaysMin,
      estimatedDaysMax: parsed.data.estimatedDaysMax,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ method });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const usedInOrder = await prisma.order.findFirst({ where: { shippingMethodId: params.id } });
  if (usedInOrder) {
    return NextResponse.json(
      { error: "Ce mode de livraison est utilisé par des commandes existantes. Désactivez-le plutôt." },
      { status: 400 }
    );
  }

  await prisma.shippingMethod.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Mode de livraison supprimé." });
}
