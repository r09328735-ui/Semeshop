"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible de changer le mot de passe.");
        return;
      }
      toast.success("Mot de passe mis à jour.");
      reset();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Mise à jour..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
