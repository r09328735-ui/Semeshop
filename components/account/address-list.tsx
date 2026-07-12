"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AddressInput } from "@/lib/validations/address";
import { AddressForm } from "@/components/shared/address-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface AddressData extends AddressInput {
  id: string;
}

const TYPE_LABEL: Record<"SHIPPING" | "BILLING", string> = {
  SHIPPING: "Livraison",
  BILLING: "Facturation",
};

export function AddressList({ initialAddresses }: { initialAddresses: AddressData[] }): JSX.Element {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AddressData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: AddressInput): Promise<void> {
    setIsSubmitting(true);
    try {
      const res = editing
        ? await fetch(`/api/account/addresses/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/account/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

      const payload = (await res.json()) as { address?: AddressData; error?: string };

      if (!res.ok || !payload.address) {
        toast.error(payload.error ?? "Impossible d'enregistrer l'adresse.");
        return;
      }

      setAddresses((prev) => {
        const withoutCurrent = prev.filter((a) => a.id !== payload.address!.id);
        const next = [...withoutCurrent, payload.address!];
        if (payload.address!.isDefault) {
          return next.map((a) =>
            a.type === payload.address!.type && a.id !== payload.address!.id
              ? { ...a, isDefault: false }
              : a
          );
        }
        return next;
      });
      toast.success("Adresse enregistrée.");
      setDialogOpen(false);
      setEditing(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(payload.error ?? "Impossible de supprimer l'adresse.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Adresse supprimée.");
  }

  return (
    <div className="space-y-4">
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogTrigger asChild>
          <Button onClick={() => setEditing(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une adresse
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'adresse" : "Nouvelle adresse"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            type={editing?.type ?? "SHIPPING"}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={editing ? "Mettre à jour" : "Ajouter l'adresse"}
            showTypeSelector
          />
        </DialogContent>
      </Dialog>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Vous n&apos;avez pas encore enregistré d&apos;adresse.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{TYPE_LABEL[address.type]}</Badge>
                {address.isDefault && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Par défaut
                  </Badge>
                )}
              </div>
              <p className="text-sm">
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.postalCode} {address.city}
                <br />
                {address.country}
                <br />
                {address.phone}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(address);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" /> Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
