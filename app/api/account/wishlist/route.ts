import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addSchema = z.object({ productId: z.string().min(1) });

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return NextResponse.json({ productIds: items.map((item) => item.productId) });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: session.user.id, productId: parsed.data.productId },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId: parsed.data.productId },
    });
  }

  return NextResponse.json({ message: "Ajouté à la liste de souhaits." }, { status: 201 });
}
