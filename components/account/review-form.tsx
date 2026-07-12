"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star as StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReviewFormProps {
  orderItemId: string;
  productName: string;
}

export function ReviewForm({ orderItemId, productName }: ReviewFormProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (rating === 0) {
      toast.error("Choisissez une note.");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Votre avis doit contenir au moins 5 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("orderItemId", orderItemId);
      formData.set("rating", String(rating));
      formData.set("title", title);
      formData.set("comment", comment);
      images.forEach((file) => formData.append("images", file));

      const res = await fetch("/api/account/reviews", { method: "POST", body: formData });
      const payload = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        toast.error(payload.error ?? "Impossible d'envoyer votre avis.");
        return;
      }

      toast.success(payload.message ?? "Avis envoyé.");
      setOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <StarIcon className="mr-2 h-4 w-4" />
          Laisser un avis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Votre avis sur {productName}</DialogTitle>
          <DialogDescription>Partagez votre expérience avec ce produit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Note</Label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-title">Titre (optionnel)</Label>
            <Input id="review-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-comment">Votre avis</Label>
            <Textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-images">Photos (optionnel, 4 max)</Label>
            <Input
              id="review-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 4))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Envoyer mon avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
