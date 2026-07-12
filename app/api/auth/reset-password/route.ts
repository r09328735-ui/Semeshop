import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`reset-password:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const body: unknown = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Le lien de réinitialisation est invalide ou a expiré." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return NextResponse.json({ message: "Mot de passe mis à jour." });
}
