import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storeImage, deleteImage } from "@/lib/media";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "L'image ne doit pas dépasser 5 Mo." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storeImage(buffer, file.name);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.image?.startsWith("/api/media/")) {
    await deleteImage(user.image);
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { image: stored.url } });

  return NextResponse.json({ url: stored.url });
}
