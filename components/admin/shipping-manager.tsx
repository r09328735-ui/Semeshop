"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
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

interface Method {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
}

export interface ShippingZoneData {
  id: string;
  name: string;
  countries: string[];
  methods: Method[];
}

export function ShippingManager({ initialZones }: { initialZones: ShippingZoneData[] }): JSX.Element {
  const [zones, setZones] = useState(initialZones);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [zoneCountries, setZoneCountries] = useState("");

  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [methodZoneId, setMethodZoneId] = useState<string | null>(null);
  const [methodForm, setMethodForm] = useState({
    name: "",
    description: "",
    cost: 0,
    estimatedDaysMin: 1,
    estimatedDaysMax: 3,
  });

  async function createZone(): Promise<void> {
    const countries = zoneCountries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (!zoneName || countries.length === 0) {
      toast.error("Nom et au moins un code pays requis.");
      return;
    }
    const res = await fetch("/api/admin/shipping-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: zoneName, countries }),
    });
    const payload = (await res.json()) as { zone?: ShippingZoneData; error?: string };
    if (!res.ok || !payload.zone) {
      toast.error(payload.error ?? "Impossible de créer la zone.");
      return;
    }
    setZones((prev) => [...prev, { ...payload.zone!, methods: [] }]);
    setZoneDialogOpen(false);
    setZoneName("");
    setZoneCountries("");
    toast.success("Zone créée.");
  }

  async function deleteZone(id: string): Promise<void> {
    const res = await fetch(`/api/admin/shipping-zones/${id}`, { method: "DELETE" });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(payload.error ?? "Impossible de supprimer la zone.");
      return;
    }
    setZones((prev) => prev.filter((z) => z.id !== id));
    toast.success("Zone supprimée.");
  }

  async function createMethod(): Promise<void> {
    if (!methodZoneId || !methodForm.name) {
      toast.error("Nom du mode de livraison requis.");
      return;
    }
    const res = await fetch("/api/admin/shipping-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...methodForm, shippingZoneId: methodZoneId, isActive: true }),
    });
    const payload = (await res.json()) as { method?: Method; error?: string };
    if (!res.ok || !payload.method) {
      toast.error(payload.error ?? "Impossible de créer le mode de livraison.");
      return;
    }
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === methodZoneId ? { ...zone, methods: [...zone.methods, payload.method!] } : zone
      )
    );
    setMethodDialogOpen(false);
    setMethodForm({ name: "", description: "", cost: 0, estimatedDaysMin: 1, estimatedDaysMax: 3 });
    toast.success("Mode de livraison créé.");
  }

  async function deleteMethod(zoneId: string, methodId: string): Promise<void> {
    const res = await fetch(`/api/admin/shipping-methods/${methodId}`, { method: "DELETE" });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(payload.error ?? "Impossible de supprimer.");
      return;
    }
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId ? { ...zone, methods: zone.methods.filter((m) => m.id !== methodId) } : zone
      )
    );
    toast.success("Mode de livraison supprimé.");
  }

  return (
    <div className="space-y-4">
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle zone de livraison
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle zone de livraison</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Nom</Label>
              <Input id="zoneName" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneCountries">Pays (codes ISO séparés par des virgules, ex: BJ,TG)</Label>
              <Input id="zoneCountries" value={zoneCountries} onChange={(e) => setZoneCountries(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoneDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createZone}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {zones.map((zone) => (
        <div key={zone.id} className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{zone.name}</h3>
              <p className="text-xs text-muted-foreground">{zone.countries.join(", ")}</p>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={methodDialogOpen && methodZoneId === zone.id}
                onOpenChange={(open) => {
                  setMethodDialogOpen(open);
                  if (open) setMethodZoneId(zone.id);
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1 h-3 w-3" /> Mode de livraison
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau mode de livraison — {zone.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={methodForm.name}
                        onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={methodForm.description}
                        onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Coût (FCFA)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={methodForm.cost}
                          onChange={(e) => setMethodForm({ ...methodForm, cost: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Délai min (j)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={methodForm.estimatedDaysMin}
                          onChange={(e) => setMethodForm({ ...methodForm, estimatedDaysMin: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Délai max (j)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={methodForm.estimatedDaysMax}
                          onChange={(e) => setMethodForm({ ...methodForm, estimatedDaysMax: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMethodDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createMethod}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteZone(zone.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {zone.methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mode de livraison pour cette zone.</p>
          ) : (
            <div className="space-y-2">
              {zone.methods.map((method) => (
                <div key={method.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <span className="font-medium">{method.name}</span>{" "}
                    <span className="text-muted-foreground">
                      ({method.estimatedDaysMin}-{method.estimatedDaysMax}j)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={method.isActive ? "success" : "secondary"}>{formatPrice(method.cost)}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMethod(zone.id, method.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
