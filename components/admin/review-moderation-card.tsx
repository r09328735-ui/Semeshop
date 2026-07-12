"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewData {
  id: string;
  productName: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminReply: string | null;
  createdAt: Date;
}

const STATUS_LABEL: Record<ReviewData["status"], string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export function ReviewModerationCard({ review }: { review: ReviewData }): JSX.Element {
  const router = useRouter();
  const [reply, setReply] = useState(review.adminReply ?? "");
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: ReviewData["status"]): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Impossible de mettre à jour l'avis.");
        return;
      }
      toast.success("Avis mis à jour.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function saveReply(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: reply }),
      });
      if (!res.ok) {
        toast.error("Impossible d'enregistrer la réponse.");
        return;
      }
      toast.success("Réponse enregistrée.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Impossible de supprimer l'avis.");
        return;
      }
      toast.success("Avis supprimé.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{review.productName}</p>
          <p className="text-xs text-muted-foreground">
            {review.userName} · {formatDate(review.createdAt)}
          </p>
        </div>
        <Badge variant={review.status === "APPROVED" ? "success" : review.status === "REJECTED" ? "destructive" : "secondary"}>
          {STATUS_LABEL[review.status]}
        </Badge>
      </div>
      <StarRating rating={review.rating} size={14} />
      {review.title && <p className="font-medium">{review.title}</p>}
      <p className="text-sm text-muted-foreground">{review.comment}</p>
      {review.images.length > 0 && (
        <div className="flex gap-2">
          {review.images.map((image, index) => (
            <div key={index} className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {review.status !== "APPROVED" && (
          <Button size="sm" onClick={() => updateStatus("APPROVED")} disabled={isLoading}>
            <Check className="mr-1 h-3 w-3" /> Approuver
          </Button>
        )}
        {review.status !== "REJECTED" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus("REJECTED")} disabled={isLoading}>
            <X className="mr-1 h-3 w-3" /> Rejeter
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <Trash2 className="mr-1 h-3 w-3" /> Supprimer
        </Button>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Répondre à cet avis..."
          rows={2}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
        <Button size="sm" variant="outline" onClick={saveReply} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Enregistrer la réponse
        </Button>
      </div>
    </div>
  );
}
