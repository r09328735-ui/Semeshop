import Image from "next/image";
import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";

export interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  adminReply: string | null;
  createdAt: Date;
  userName: string;
}

export function ReviewList({ reviews }: { reviews: ReviewData[] }): JSX.Element {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun avis pour ce produit pour le moment.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">{review.userName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} size={14} className="mb-2" />
          {review.title && <p className="font-medium">{review.title}</p>}
          <p className="text-sm text-muted-foreground">{review.comment}</p>
          {review.images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {review.images.map((image, index) => (
                <div key={index} className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                  <Image src={image} alt="Photo de l'avis" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          {review.adminReply && (
            <div className="mt-3 rounded-md bg-muted p-3 text-sm">
              <p className="mb-1 font-medium">Réponse du vendeur</p>
              <p className="text-muted-foreground">{review.adminReply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
