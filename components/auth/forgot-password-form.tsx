"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorResponse {
  error?: string;
}

export function ForgotPasswordForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = (await res.json()) as ErrorResponse;
        toast.error(payload.error ?? "Une erreur est survenue.");
        return;
      }
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Indiquez votre email, nous vous enverrons un lien de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-muted-foreground">
            Si un compte existe avec cet email, un lien de réinitialisation vient de lui être
            envoyé.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
