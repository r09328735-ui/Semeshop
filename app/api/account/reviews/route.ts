import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";
import { storeImage } from "@/lib/media";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_IMAGES = 4;

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await req.formData();
  const orderItemId = formData.get("orderItemId");
  const rating = Number(formData.get("rating"));
  const title = formData.get("title");
  const comment = formData.get("comment");
  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);

  if (files.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Maximum ${MAX_IMAGES} photos par avis.` }, { status: 400 });
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Chaque fichier doit être une image." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Chaque image doit faire moins de 5 Mo." }, { status: 400 });
    }
  }

  const parsed = reviewSchema.safeParse({
    orderItemId: typeof orderItemId === "string" ? orderItemId : "",
    rating,
    title: typeof title === "string" ? title : "",
    comment: typeof comment === "string" ? comment : "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: parsed.data.orderItemId },
    include: { order: true, review: true },
  });

  if (!orderItem || orderItem.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Article de commande introuvable." }, { status: 404 });
  }
  if (orderItem.order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "Vous pouvez laisser un avis une fois la commande livrée." },
      { status: 400 }
    );
  }
  if (orderItem.review) {
    return NextResponse.json({ error: "Vous avez déjà laissé un avis pour cet article." }, { status: 400 });
  }

  const imageUrls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeImage(buffer, file.name);
    imageUrls.push(stored.url);
  }

  const review = await prisma.review.create({
    data: {
      productId: orderItem.productId,
      userId: session.user.id,
      orderItemId: orderItem.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment,
      images: imageUrls,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    { message: "Merci, votre avis a été soumis et sera visible après modération.", review },
    { status: 201 }
  );
}
