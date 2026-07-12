"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { couponSchema, type CouponInput } from "@/lib/validations/coupon";
import { formatDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface CouponData {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export function CouponManager({ initialCoupons }: { initialCoupons: CouponData[] }): JSX.Element {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CouponData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: "PERCENTAGE", isActive: true },
  });

  function openCreate(): void {
    setEditing(null);
    reset({ code: "", type: "PERCENTAGE", value: 0, minPurchase: null, maxUses: null, isActive: true });
    setDialogOpen(true);
  }

  function openEdit(coupon: CouponData): void {
    setEditing(coupon);
    reset({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxUses: coupon.maxUses,
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 10) : null,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : null,
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: CouponInput): Promise<void> {
    setIsSubmitting(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/coupons/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

      const payload = (await res.json()) as { coupon?: CouponData; error?: string };
      if (!res.ok || !payload.coupon) {
        toast.error(payload.error ?? "Impossible d'enregistrer le code promo.");
        return;
      }

      setCoupons((prev) => {
        const without = prev.filter((c) => c.id !== payload.coupon!.id);
        return [payload.coupon!, ...without];
      });
      toast.success("Code promo enregistré.");
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Impossible de supprimer le code promo.");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Code promo supprimé.");
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau code promo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le code promo" : "Nouveau code promo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...register("code")} className="uppercase" />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={watch("type")} onValueChange={(v) => setValue("type", v as CouponInput["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                    <SelectItem value="FIXED">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valeur</Label>
                <Input id="value" type="number" min={0} {...register("value", { valueAsNumber: true })} />
                {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Achat minimum (FCFA)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min={0}
                  {...register("minPurchase", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Utilisations max.</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min={1}
                  {...register("maxUses", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Début de validité</Label>
                <Input id="startsAt" type="date" {...register("startsAt")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Fin de validité</Label>
                <Input id="expiresAt" type="date" {...register("expiresAt")} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", Boolean(checked))}
              />
              <Label htmlFor="isActive" className="cursor-pointer font-normal">
                Actif
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Réduction</th>
              <th className="p-3">Utilisation</th>
              <th className="p-3">Validité</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b last:border-0">
                <td className="p-3 font-mono font-medium">{coupon.code}</td>
                <td className="p-3">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatPrice(coupon.value)}
                  {coupon.minPurchase ? ` (min. ${formatPrice(coupon.minPurchase)})` : ""}
                </td>
                <td className="p-3">
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </td>
                <td className="p-3 text-muted-foreground">
                  {coupon.startsAt ? formatDate(coupon.startsAt) : "—"} →{" "}
                  {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Illimité"}
                </td>
                <td className="p-3">
                  <Badge variant={coupon.isActive ? "success" : "secondary"}>
                    {coupon.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(coupon)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucun code promo.</p>}
      </div>
    </div>
  );
}
