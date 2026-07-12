"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  variant?: "icon" | "full";
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  variant = "icon",
}: WishlistButtonProps): JSX.Element {
  const router = useRouter();
  const { status } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  async function toggle(event: React.MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/produits");
      return;
    }

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await fetch(`/api/account/wishlist/${productId}`, { method: "DELETE" });
        setIsWishlisted(false);
        toast.success("Retiré de la liste de souhaits.");
      } else {
        await fetch("/api/account/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setIsWishlisted(true);
        toast.success("Ajouté à la liste de souhaits.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "full") {
    return (
      <Button variant="outline" onClick={toggle} disabled={isLoading} className="w-full">
        <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
        {isWishlisted ? "Dans ma liste de souhaits" : "Ajouter à ma liste de souhaits"}
      </Button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
    >
      <Heart className={cn("h-4 w-4", isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
    </button>
  );
}
