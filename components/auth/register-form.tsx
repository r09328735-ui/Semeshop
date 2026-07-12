"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";

interface RegisterErrorResponse {
  error?: string;
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = (await res.json()) as RegisterErrorResponse;
        toast.error(payload.error ?? "Une erreur est survenue.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Compte créé. Connectez-vous.");
        router.push("/login");
        return;
      }

      toast.success("Bienvenue !");
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Rejoignez Semeshop en quelques secondes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        {googleEnabled && (
          <>
            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                ou
              </span>
            </div>
            <GoogleButton />
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
