"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

export function ProductFilters({ categories }: ProductFiltersProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [prixMin, setPrixMin] = useState(searchParams.get("prixMin") ?? "");
  const [prixMax, setPrixMax] = useState(searchParams.get("prixMax") ?? "");

  const currentCategorie = searchParams.get("categorie") ?? "";
  const enStock = searchParams.get("disponibilite") === "en-stock";
  const currentNote = searchParams.get("note") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <aside className="w-full shrink-0 space-y-6 md:w-56">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Catégorie</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams({ categorie: null })}
            className={`block text-sm ${currentCategorie === "" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParams({ categorie: category.slug })}
              className={`block text-sm ${currentCategorie === category.slug ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Prix (FCFA)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={prixMin}
            onChange={(event) => setPrixMin(event.target.value)}
            onBlur={() => updateParams({ prixMin: prixMin || null })}
            className="h-8"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={prixMax}
            onChange={(event) => setPrixMax(event.target.value)}
            onBlur={() => updateParams({ prixMax: prixMax || null })}
            className="h-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="en-stock"
          checked={enStock}
          onCheckedChange={(checked) => updateParams({ disponibilite: checked ? "en-stock" : null })}
        />
        <Label htmlFor="en-stock" className="cursor-pointer text-sm font-normal">
          En stock uniquement
        </Label>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Note minimale</h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((note) => (
            <button
              key={note}
              onClick={() => updateParams({ note: currentNote === String(note) ? null : String(note) })}
              className={`block text-sm ${currentNote === String(note) ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {note}+ étoiles
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          setPrixMin("");
          setPrixMax("");
          router.push(pathname);
        }}
      >
        Réinitialiser les filtres
      </Button>
    </aside>
  );
}
