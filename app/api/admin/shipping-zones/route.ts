import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { shippingZoneSchema } from "@/lib/validations/settings";

export async function GET(): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const zones = await prisma.shippingZone.findMany({
    orderBy: { createdAt: "asc" },
    include: { methods: true },
  });

  return NextResponse.json({ zones });
}

export async function POST(req: Request): Promise<NextResponse> {
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

  const zone = await prisma.shippingZone.create({
    data: { name: parsed.data.name, countries: parsed.data.countries },
  });

  return NextResponse.json({ zone }, { status: 201 });
}
