"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }): JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-destructive">500</h1>
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="max-w-md text-muted-foreground">
        Quelque chose s&apos;est mal passé de notre côté. Veuillez réessayer dans quelques instants.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
