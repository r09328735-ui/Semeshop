"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée" },
];

interface OrderStatusFormProps {
  orderNumber: string;
  currentStatus: OrderStatus;
  currentTrackingNumber: string | null;
  currentCarrier: string | null;
}

export function OrderStatusForm({
  orderNumber,
  currentStatus,
  currentTrackingNumber,
  currentCarrier,
}: OrderStatusFormProps): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? "");
  const [carrier, setCarrier] = useState(currentCarrier ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber, carrier }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible de mettre à jour la commande.");
        return;
      }
      toast.success("Commande mise à jour.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Gestion de la commande</h3>
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tracking">Numéro de suivi</Label>
          <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carrier">Transporteur</Label>
          <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}
