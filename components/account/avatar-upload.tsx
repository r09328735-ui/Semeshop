"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
  currentImage: string | null;
  name: string | null;
}

export function AvatarUpload({ currentImage, name }: AvatarUploadProps): JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: formData });
      const payload = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        toast.error(payload.error ?? "Impossible de mettre à jour la photo.");
        return;
      }

      setPreview(payload.url);
      toast.success("Photo de profil mise à jour.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  const initials = (name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={preview ?? undefined} alt={name ?? ""} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
          Changer la photo
        </Button>
      </div>
    </div>
  );
}
