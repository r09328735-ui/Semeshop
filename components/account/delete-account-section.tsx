"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountSection({ hasPassword }: { hasPassword: boolean }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible de supprimer le compte.");
        return;
      }
      toast.success("Compte supprimé.");
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-destructive/50 p-4">
      <h3 className="mb-1 font-semibold text-destructive">Supprimer mon compte</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Cette action est irréversible. Votre profil, vos adresses et votre liste de souhaits seront
        définitivement supprimés.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Supprimer mon compte</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression du compte</DialogTitle>
            <DialogDescription>
              Cette action est définitive. {hasPassword && "Saisissez votre mot de passe pour confirmer."}
            </DialogDescription>
          </DialogHeader>
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="delete-password">Mot de passe</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
