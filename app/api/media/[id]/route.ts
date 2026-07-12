import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams): Promise<NextResponse> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: params.id } });

  if (!asset) {
    return NextResponse.json({ error: "Image introuvable." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
