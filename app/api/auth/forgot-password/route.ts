import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`forgot-password:${ip}`, { limit: 5, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const body: unknown = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours renvoyer une réponse identique pour ne pas révéler quels emails sont enregistrés.
  if (user && user.password) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expires } });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({ message: "Si ce compte existe, un email a été envoyé." });
}
