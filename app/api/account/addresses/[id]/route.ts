import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations/address";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Adresse invalide.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, type: parsed.data.type, id: { not: params.id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({ where: { id: params.id }, data: parsed.data });

  return NextResponse.json({ address });
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Adresse introuvable." }, { status: 404 });
  }

  const usedInOrder = await prisma.order.findFirst({
    where: { OR: [{ shippingAddressId: params.id }, { billingAddressId: params.id }] },
  });
  if (usedInOrder) {
    return NextResponse.json(
      { error: "Cette adresse est associée à une commande et ne peut pas être supprimée." },
      { status: 400 }
    );
  }

  await prisma.address.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Adresse supprimée." });
}
