"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function CustomerActions({ customerId, isActive }: { customerId: string; isActive: boolean }): JSX.Element {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function toggleActive(): Promise<void> {
    setIsToggling(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const payload = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible de mettre à jour le compte.");
        return;
      }
      toast.success(payload.message);
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  }

  async function resetPassword(): Promise<void> {
    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/reset-password`, { method: "POST" });
      const payload = (await res.json()) as { temporaryPassword?: string; error?: string };
      if (!res.ok || !payload.temporaryPassword) {
        toast.error(payload.error ?? "Impossible de réinitialiser le mot de passe.");
        return;
      }
      setTempPassword(payload.temporaryPassword);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={toggleActive} disabled={isToggling}>
        {isActive ? "Désactiver le compte" : "Réactiver le compte"}
      </Button>

      <Dialog
        open={resetDialogOpen}
        onOpenChange={(open) => {
          setResetDialogOpen(open);
          if (!open) setTempPassword(null);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Réinitialiser le mot de passe</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Un nouveau mot de passe temporaire sera généré. Communiquez-le au client sur WhatsApp.
            </DialogDescription>
          </DialogHeader>
          {tempPassword ? (
            <div className="rounded-md border bg-accent p-4 text-center">
              <p className="text-sm text-muted-foreground">Nouveau mot de passe :</p>
              <p className="mt-1 text-lg font-mono font-semibold">{tempPassword}</p>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={resetPassword} disabled={isResetting}>
                {isResetting ? "Génération..." : "Générer un nouveau mot de passe"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
