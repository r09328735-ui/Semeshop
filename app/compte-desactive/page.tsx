"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AccountDisabledPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Compte désactivé</h1>
      <p className="max-w-md text-muted-foreground">
        Votre compte a été désactivé par un administrateur. Contactez le support si vous pensez
        qu&apos;il s&apos;agit d&apos;une erreur.
      </p>
      <Button onClick={() => void signOut({ callbackUrl: "/" })}>Se déconnecter</Button>
    </main>
  );
}
