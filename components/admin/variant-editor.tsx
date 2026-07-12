"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface VariantData {
  key: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceModifier: number;
}

interface VariantEditorProps {
  variants: VariantData[];
  onChange: (variants: VariantData[]) => void;
  baseSku: string;
}

export function VariantEditor({ variants, onChange, baseSku }: VariantEditorProps): JSX.Element {
  function addVariant(): void {
    onChange([
      ...variants,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        size: "",
        color: "",
        sku: baseSku ? `${baseSku}-${variants.length + 1}` : "",
        stock: 0,
        priceModifier: 0,
      },
    ]);
  }

  function updateVariant(key: string, patch: Partial<VariantData>): void {
    onChange(variants.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function removeVariant(key: string): void {
    onChange(variants.filter((v) => v.key !== key));
  }

  return (
    <div className="space-y-3">
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune variante : le produit utilise le stock et le prix de base.
        </p>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <div key={variant.key} className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">Taille</Label>
                <Input
                  value={variant.size}
                  onChange={(e) => updateVariant(variant.key, { size: e.target.value })}
                  placeholder="M"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Couleur</Label>
                <Input
                  value={variant.color}
                  onChange={(e) => updateVariant(variant.key, { color: e.target.value })}
                  placeholder="Rouge"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SKU</Label>
                <Input value={variant.sku} onChange={(e) => updateVariant(variant.key, { sku: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) => updateVariant(variant.key, { stock: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Modif. prix (FCFA)</Label>
                  <Input
                    type="number"
                    value={variant.priceModifier}
                    onChange={(e) => updateVariant(variant.key, { priceModifier: Number(e.target.value) })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeVariant(variant.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addVariant}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une variante
      </Button>
    </div>
  );
}
