import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validations/coupon";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const existing = await prisma.coupon.findFirst({ where: { code: parsed.data.code, id: { not: params.id } } });
  if (existing) {
    return NextResponse.json({ error: "Ce code promo existe déjà." }, { status: 409 });
  }

  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minPurchase: parsed.data.minPurchase ?? null,
      maxUses: parsed.data.maxUses ?? null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ coupon });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.coupon.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Code promo supprimé." });
}
