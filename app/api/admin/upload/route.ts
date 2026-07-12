import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { storeImage } from "@/lib/media";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 Mo

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "L'image ne doit pas dépasser 8 Mo." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storeImage(buffer, file.name);

  return NextResponse.json({ url: stored.url, width: stored.width, height: stored.height }, { status: 201 });
}
