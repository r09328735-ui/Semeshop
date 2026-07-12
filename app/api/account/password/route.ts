import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/profile";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { success } = await rateLimit(`change-password:${session.user.id}`, { limit: 5, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body: unknown = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) {
    return NextResponse.json(
      { error: "Ce compte utilise une connexion externe et n'a pas de mot de passe." },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  return NextResponse.json({ message: "Mot de passe mis à jour." });
}
