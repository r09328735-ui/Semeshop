import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`contact:${ip}`, { limit: 5, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const body: unknown = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.contactMessage.create({ data: parsed.data });

  return NextResponse.json({ message: "Votre message a bien été envoyé." }, { status: 201 });
}
