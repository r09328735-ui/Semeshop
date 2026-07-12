"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelOrderButton({ orderNumber }: { orderNumber: string }): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/account/orders/${orderNumber}/cancel`, { method: "POST" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible d'annuler la commande.");
        return;
      }
      toast.success("Commande annulée.");
      setOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive">
          Annuler la commande
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler la commande {orderNumber} ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Le stock des articles sera automatiquement remis à jour.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Retour
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer l&apos;annulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
