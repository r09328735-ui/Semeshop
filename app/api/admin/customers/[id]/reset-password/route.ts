import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) password += chars[Math.floor(Math.random() * chars.length)];
  return password;
}

export async function POST(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const customer = await prisma.user.findUnique({ where: { id: params.id } });
  if (!customer) {
    return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({ where: { id: params.id }, data: { password: hashedPassword } });

  return NextResponse.json({ temporaryPassword: tempPassword });
}
