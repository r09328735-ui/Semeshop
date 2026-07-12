import type { Metadata } from "next";
import type { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ReviewModerationCard } from "@/components/admin/review-moderation-card";

export const metadata: Metadata = { title: "Avis — Admin" };
export const dynamic = "force-dynamic";

const VALID_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

interface AdminReviewsPageProps {
  searchParams: { statut?: string };
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps): Promise<JSX.Element> {
  const status =
    searchParams.statut && VALID_STATUSES.includes(searchParams.statut as ReviewStatus)
      ? (searchParams.statut as ReviewStatus)
      : undefined;

  const reviews = await prisma.review.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { product: true, user: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Avis clients</h1>

      <div className="flex gap-2">
        {[
          { label: "Tous", value: "" },
          { label: "En attente", value: "PENDING" },
          { label: "Approuvés", value: "APPROVED" },
          { label: "Rejetés", value: "REJECTED" },
        ].map((filter) => (
          <a
            key={filter.value}
            href={filter.value ? `/admin/avis?statut=${filter.value}` : "/admin/avis"}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              (searchParams.statut ?? "") === filter.value ? "bg-accent font-medium" : "text-muted-foreground"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewModerationCard
              key={review.id}
              review={{
                id: review.id,
                productName: review.product.name,
                userName: review.user.name ?? "Client",
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                images: review.images,
                status: review.status,
                adminReply: review.adminReply,
                createdAt: review.createdAt,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
