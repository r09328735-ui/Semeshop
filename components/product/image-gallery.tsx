"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

export function ImageGallery({ images, productName }: { images: GalleryImage[]; productName: string }): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = images[activeIndex];

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  }

  if (!active) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Pas d&apos;image disponible
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomStyle(null)}
      >
        <Image
          src={active.url}
          alt={active.alt ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn("object-cover transition-transform duration-200", zoomStyle && "scale-[1.8]")}
          style={zoomStyle ?? undefined}
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 bg-muted",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt ?? productName} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
