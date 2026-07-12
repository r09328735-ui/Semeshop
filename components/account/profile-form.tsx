"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  defaultValues: { name: string; phone: string; email: string };
}

export function ProfileForm({ defaultValues }: ProfileFormProps): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: defaultValues.name, phone: defaultValues.phone },
  });

  async function onSubmit(data: ProfileInput): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible de mettre à jour le profil.");
        return;
      }
      toast.success("Profil mis à jour.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={defaultValues.email} disabled />
        <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
