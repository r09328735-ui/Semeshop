import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { taxRateSchema } from "@/lib/validations/settings";

export async function GET(): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const taxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ taxRates });
}

export async function POST(req: Request): Promise<NextResponse> {
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

  const taxRate = await prisma.taxRate.create({
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      state: parsed.data.state || null,
      rate: parsed.data.rate,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ taxRate }, { status: 201 });
}
