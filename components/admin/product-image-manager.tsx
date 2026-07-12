"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ProductImageData {
  key: string;
  url: string;
  alt: string;
  isMain: boolean;
}

interface ProductImageManagerProps {
  images: ProductImageData[];
  onChange: (images: ProductImageData[]) => void;
}

function SortableImage({
  image,
  onSetMain,
  onRemove,
}: {
  image: ProductImageData;
  onSetMain: () => void;
  onRemove: () => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.key,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-md border bg-muted",
        isDragging && "z-10 opacity-70",
        image.isMain && "ring-2 ring-primary"
      )}
    >
      <Image src={image.url} alt={image.alt} fill sizes="150px" className="object-cover" />
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="absolute left-1 top-1 rounded bg-background/80 p-1 opacity-0 group-hover:opacity-100"
        aria-label="Réorganiser"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onSetMain}
          className={cn(
            "rounded bg-background/80 p-1",
            image.isMain ? "text-amber-500" : "text-muted-foreground"
          )}
          aria-label="Définir comme image principale"
          title="Image principale"
        >
          <Star className={cn("h-4 w-4", image.isMain && "fill-amber-400")} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded bg-background/80 p-1 text-destructive"
          aria-label="Supprimer l'image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {image.isMain && (
        <span className="absolute right-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          Principale
        </span>
      )}
    </div>
  );
}

export function ProductImageManager({ images, onChange }: ProductImageManagerProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function uploadFiles(files: FileList | File[]): Promise<void> {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: ProductImageData[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const payload = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !payload.url) {
          toast.error(payload.error ?? `Échec de l'upload de ${file.name}`);
          continue;
        }
        uploaded.push({
          key: payload.url,
          url: payload.url,
          alt: "",
          isMain: false,
        });
      }
      if (uploaded.length > 0) {
        const next = [...images, ...uploaded];
        if (!next.some((img) => img.isMain) && next.length > 0) {
          next[0]!.isMain = true;
        }
        onChange(next);
      }
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.key === active.id);
    const newIndex = images.findIndex((img) => img.key === over.id);
    onChange(arrayMove(images, oldIndex, newIndex));
  }

  function handleSetMain(key: string): void {
    onChange(images.map((img) => ({ ...img, isMain: img.key === key })));
  }

  function handleRemove(key: string): void {
    const next = images.filter((img) => img.key !== key);
    if (next.length > 0 && !next.some((img) => img.isMain)) {
      next[0]!.isMain = true;
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDraggingOver(false);
          void uploadFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center text-sm text-muted-foreground",
          isDraggingOver && "border-primary bg-accent"
        )}
      >
        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        <p>Glissez-déposez des images ici, ou</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => event.target.files && void uploadFiles(event.target.files)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Choisir des fichiers
        </Button>
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.key)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {images.map((image) => (
                <SortableImage
                  key={image.key}
                  image={image}
                  onSetMain={() => handleSetMain(image.key)}
                  onRemove={() => handleRemove(image.key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
