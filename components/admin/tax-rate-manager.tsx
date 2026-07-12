"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface TaxRateData {
  id: string;
  name: string;
  country: string;
  state: string | null;
  rate: number;
  isActive: boolean;
}

export function TaxRateManager({ initialTaxRates }: { initialTaxRates: TaxRateData[] }): JSX.Element {
  const [taxRates, setTaxRates] = useState(initialTaxRates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", state: "", rate: 0 });

  async function createTaxRate(): Promise<void> {
    if (!form.name || form.country.length !== 2) {
      toast.error("Nom et code pays (2 lettres) requis.");
      return;
    }
    const res = await fetch("/api/admin/tax-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, country: form.country.toUpperCase(), isActive: true }),
    });
    const payload = (await res.json()) as { taxRate?: TaxRateData; error?: string };
    if (!res.ok || !payload.taxRate) {
      toast.error(payload.error ?? "Impossible de créer la taxe.");
      return;
    }
    setTaxRates((prev) => [...prev, payload.taxRate!]);
    setDialogOpen(false);
    setForm({ name: "", country: "", state: "", rate: 0 });
    toast.success("Taxe créée.");
  }

  async function deleteTaxRate(id: string): Promise<void> {
    const res = await fetch(`/api/admin/tax-rates/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Impossible de supprimer la taxe.");
      return;
    }
    setTaxRates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Taxe supprimée.");
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle taxe
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle taxe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="TVA Bénin" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pays (code ISO)</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  maxLength={2}
                  placeholder="BJ"
                />
              </div>
              <div className="space-y-2">
                <Label>Taux (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createTaxRate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {taxRates.map((taxRate) => (
          <div key={taxRate.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <span className="font-medium">{taxRate.name}</span>{" "}
              <span className="text-muted-foreground">
                ({taxRate.country}
                {taxRate.state ? `, ${taxRate.state}` : ""})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={taxRate.isActive ? "success" : "secondary"}>{taxRate.rate}%</Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive"
                onClick={() => deleteTaxRate(taxRate.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {taxRates.length === 0 && <p className="text-sm text-muted-foreground">Aucune taxe configurée.</p>}
      </div>
    </div>
  );
}
