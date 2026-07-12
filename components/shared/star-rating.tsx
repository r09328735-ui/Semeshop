import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 16, className }: StarRatingProps): JSX.Element {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Note : ${rating.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          width={size}
          height={size}
          className={cn(
            star <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}
