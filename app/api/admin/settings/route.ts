import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { storeSettingsSchema } from "@/lib/validations/settings";

export async function PATCH(req: Request): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body: unknown = await req.json();
  const parsed = storeSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const existing = await prisma.storeSettings.findFirst();

  const data = {
    name: parsed.data.name,
    logo: parsed.data.logo || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    whatsappNumber: parsed.data.whatsappNumber || null,
    address: parsed.data.address || null,
    facebookUrl: parsed.data.facebookUrl || null,
    instagramUrl: parsed.data.instagramUrl || null,
    twitterUrl: parsed.data.twitterUrl || null,
    currency: parsed.data.currency,
    freeShippingThreshold: parsed.data.freeShippingThreshold ?? null,
  };

  const settings = existing
    ? await prisma.storeSettings.update({ where: { id: existing.id }, data })
    : await prisma.storeSettings.create({ data });

  return NextResponse.json({ settings });
}
