import { prisma } from "@/lib/prisma";

export async function recalculateProductRating(productId: string): Promise<void> {
  const approvedReviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    select: { rating: true },
  });

  const reviewCount = approvedReviews.length;
  const avgRating =
    reviewCount > 0 ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: Math.round(avgRating * 100) / 100, reviewCount },
  });
}
