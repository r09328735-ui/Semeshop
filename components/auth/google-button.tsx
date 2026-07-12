"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GoogleButton({ callbackUrl = "/" }: { callbackUrl?: string }): JSX.Element {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => void signIn("google", { callbackUrl })}
    >
      Continuer avec Google
    </Button>
  );
}
