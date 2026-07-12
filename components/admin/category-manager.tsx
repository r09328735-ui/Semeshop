"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import slugify from "slugify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  position: number;
  productCount: number;
  childCount: number;
}

export function CategoryManager({ initialCategories }: { initialCategories: CategoryData[] }): JSX.Element {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryData | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  const topLevel = useMemo(
    () => categories.filter((c) => !c.parentId).sort((a, b) => a.position - b.position),
    [categories]
  );
  const childrenOf = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId).sort((a, b) => a.position - b.position);

  function openCreate(parentId?: string): void {
    setEditing(null);
    setImage(null);
    reset({ name: "", slug: "", description: "", parentId: parentId ?? "" });
    setDialogOpen(true);
  }

  function openEdit(category: CategoryData): void {
    setEditing(category);
    setImage(category.image);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      parentId: category.parentId ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: CategoryInput): Promise<void> {
    setIsSubmitting(true);
    try {
      const payload = { ...data, image: image ?? "" };
      const res = editing
        ? await fetch(`/api/admin/categories/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const result = (await res.json()) as { category?: CategoryData & { _count?: unknown }; error?: string };
      if (!res.ok) {
        toast.error(result.error ?? "Impossible d'enregistrer la catégorie.");
        return;
      }

      toast.success("Catégorie enregistrée.");
      setDialogOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(payload.error ?? "Impossible de supprimer.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Catégorie supprimée.");
  }

  async function handleReorder(id: string, direction: "up" | "down"): Promise<void> {
    const res = await fetch(`/api/admin/categories/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) {
      toast.error("Impossible de déplacer la catégorie.");
      return;
    }
    router.refresh();
  }

  function renderRow(category: CategoryData, depth: number): JSX.Element {
    return (
      <div key={category.id}>
        <div
          className="flex items-center justify-between rounded-md border p-3"
          style={{ marginLeft: depth * 24 }}
        >
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              /{category.slug} · {category.productCount} produit(s)
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReorder(category.id, "up")}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReorder(category.id, "down")}>
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCreate(category.id)}>
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(category)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {childrenOf(category.id).map((child) => renderRow(child, depth + 1))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => openCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <SingleImageUpload value={image} onChange={setImage} label="Image de catégorie" />
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom</Label>
              <Input
                id="cat-name"
                {...register("name")}
                onChange={(event) => {
                  setValue("name", event.target.value);
                  if (!editing) {
                    setValue("slug", slugify(event.target.value, { lower: true, strict: true }));
                  }
                }}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" {...register("slug")} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea id="cat-description" rows={3} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Catégorie parente</Label>
              <Select
                value={watch("parentId") || "none"}
                onValueChange={(value) => setValue("parentId", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                  {categories
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

      {topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune catégorie pour le moment.</p>
      ) : (
        <div className="space-y-2">{topLevel.map((category) => renderRow(category, 0))}</div>
      )}
    </div>
  );
}
