import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  if (user.password) {
    if (!body.password) {
      return NextResponse.json({ error: "Mot de passe requis pour confirmer la suppression." }, { status: 400 });
    }
    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 400 });
    }
  }

  // Les commandes doivent être conservées comme pièces comptables même après
  // suppression du compte ; comme les adresses sont supprimées en cascade
  // avec l'utilisateur, on bloque la suppression s'il existe un historique
  // de commandes plutôt que de casser les factures existantes.
  const hasOrders = await prisma.order.findFirst({ where: { userId: user.id } });
  if (hasOrders) {
    return NextResponse.json(
      {
        error:
          "Vous avez un historique de commandes. Contactez-nous sur WhatsApp pour fermer votre compte manuellement.",
      },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ message: "Compte supprimé." });
}
