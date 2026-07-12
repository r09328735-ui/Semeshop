"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ProductImageManager, type ProductImageData } from "@/components/admin/product-image-manager";
import { VariantEditor, type VariantData } from "@/components/admin/variant-editor";
import type { ProductInput } from "@/lib/validations/product";

export interface ProductFormCategory {
  id: string;
  name: string;
}

export interface ProductFormInitialValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  categoryIds: string[];
  images: ProductImageData[];
  variants: VariantData[];
}

interface ProductFormProps {
  categories: ProductFormCategory[];
  initialValues?: ProductFormInitialValues;
}

const EMPTY_VALUES: ProductFormInitialValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  sku: "",
  stock: 0,
  lowStockThreshold: 5,
  weight: null,
  length: null,
  width: null,
  height: null,
  status: "DRAFT",
  isFeatured: false,
  categoryIds: [],
  images: [],
  variants: [],
};

export function ProductForm({ categories, initialValues }: ProductFormProps): JSX.Element {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);
  const [values, setValues] = useState<ProductFormInitialValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ProductFormInitialValues>(key: K, value: ProductFormInitialValues[K]): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(categoryId: string): void {
    setValues((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (values.categoryIds.length === 0) {
      toast.error("Choisissez au moins une catégorie.");
      return;
    }
    if (!values.description || values.description === "<p></p>") {
      toast.error("La description est requise.");
      return;
    }

    const payload: ProductInput = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      sku: values.sku,
      stock: values.stock,
      lowStockThreshold: values.lowStockThreshold,
      weight: values.weight,
      length: values.length,
      width: values.width,
      height: values.height,
      status: values.status,
      isFeatured: values.isFeatured,
      categoryIds: values.categoryIds,
      images: values.images.map((img) => ({ url: img.url, alt: img.alt, isMain: img.isMain })),
      variants: values.variants.map((v) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        priceModifier: v.priceModifier,
      })),
    };

    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await fetch(`/api/admin/products/${initialValues!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const result = (await res.json()) as { error?: string; product?: { id: string } };

      if (!res.ok) {
        toast.error(result.error ?? "Impossible d'enregistrer le produit.");
        return;
      }

      toast.success(isEditing ? "Produit mis à jour." : "Produit créé.");
      router.push("/admin/produits");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  if (!slugTouched) update("slug", slugify(e.target.value, { lower: true, strict: true }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor value={values.description} onChange={(html) => update("description", html)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageManager images={values.images} onChange={(images) => update("images", images)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prix et inventaire</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => update("price", Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Prix barré (optionnel)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min={0}
              value={values.compareAtPrice ?? ""}
              onChange={(e) => update("compareAtPrice", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={values.sku} onChange={(e) => update("sku", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock {values.variants.length > 0 && "(calculé depuis les variantes)"}</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={values.variants.length > 0 ? values.variants.reduce((s, v) => s + v.stock, 0) : values.stock}
              onChange={(e) => update("stock", Number(e.target.value))}
              disabled={values.variants.length > 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Seuil de stock bas</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min={0}
              value={values.lowStockThreshold}
              onChange={(e) => update("lowStockThreshold", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variantes (taille / couleur)</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantEditor
            variants={values.variants}
            onChange={(variants) => update("variants", variants)}
            baseSku={values.sku}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Livraison</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={0}
              step={0.01}
              value={values.weight ?? ""}
              onChange={(e) => update("weight", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length">Longueur (cm)</Label>
            <Input
              id="length"
              type="number"
              min={0}
              value={values.length ?? ""}
              onChange={(e) => update("length", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Largeur (cm)</Label>
            <Input
              id="width"
              type="number"
              min={0}
              value={values.width ?? ""}
              onChange={(e) => update("width", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Hauteur (cm)</Label>
            <Input
              id="height"
              type="number"
              min={0}
              value={values.height ?? ""}
              onChange={(e) => update("height", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catégories et statut</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Catégories</Label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={values.categoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={values.status} onValueChange={(v) => update("status", v as ProductFormInitialValues["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PUBLISHED">Publié</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="isFeatured"
                checked={values.isFeatured}
                onCheckedChange={(checked) => update("isFeatured", Boolean(checked))}
              />
              <Label htmlFor="isFeatured" className="cursor-pointer font-normal">
                Produit mis en avant sur la page d&apos;accueil
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/produits")}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
