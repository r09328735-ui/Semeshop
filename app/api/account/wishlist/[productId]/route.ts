import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { productId: string };
}

export async function DELETE(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId: params.productId },
  });

  return NextResponse.json({ message: "Retiré de la liste de souhaits." });
}
