import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { shippingMethodSchema } from "@/lib/validations/settings";

export async function POST(req: Request): Promise<NextResponse> {
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

  const method = await prisma.shippingMethod.create({
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

  return NextResponse.json({ method }, { status: 201 });
}
