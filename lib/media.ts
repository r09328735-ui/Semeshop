import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 80;

export interface StoredMedia {
  id: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Compresses an uploaded image and stores it as a MongoDB document, since
 * this project stores media in MongoDB instead of a third-party CDN.
 */
export async function storeImage(buffer: Buffer, filename?: string): Promise<StoredMedia> {
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const outputBuffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  const asset = await prisma.mediaAsset.create({
    data: {
      data: outputBuffer,
      contentType: "image/jpeg",
      filename,
      width: outputMetadata.width ?? metadata.width ?? null,
      height: outputMetadata.height ?? metadata.height ?? null,
    },
  });

  return {
    id: asset.id,
    url: `/api/media/${asset.id}`,
    width: outputMetadata.width ?? 0,
    height: outputMetadata.height ?? 0,
  };
}

export async function deleteImage(url: string): Promise<void> {
  const id = url.split("/api/media/")[1];
  if (!id) return;
  await prisma.mediaAsset.deleteMany({ where: { id } });
}
