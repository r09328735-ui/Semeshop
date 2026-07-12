"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput): Promise<void> {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", { ...data, redirect: false });

      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin" ? "Email ou mot de passe incorrect." : result.error
        );
        return;
      }

      toast.success("Connexion réussie.");
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connectez-vous pour accéder à votre compte.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
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
            <GoogleButton callbackUrl={callbackUrl} />
          </>
        )}

        <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="hover:text-foreground hover:underline">
            Mot de passe oublié ?
          </Link>
          <p>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
