"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps): JSX.Element {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} étoile(s)`}
        >
          <Star
            className={cn(
              "h-6 w-6",
              star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
