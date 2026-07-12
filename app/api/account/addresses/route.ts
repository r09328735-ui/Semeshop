import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations/address";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Adresse invalide.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, type: parsed.data.type },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({ data: { ...parsed.data, userId } });

  return NextResponse.json({ address }, { status: 201 });
}
