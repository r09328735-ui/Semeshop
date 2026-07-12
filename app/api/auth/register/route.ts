import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const body: unknown = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
