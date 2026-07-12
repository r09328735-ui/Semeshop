"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { storeSettingsSchema, type StoreSettingsInput } from "@/lib/validations/settings";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoreSettingsFormProps {
  defaultValues: StoreSettingsInput;
}

export function StoreSettingsForm({ defaultValues }: StoreSettingsFormProps): JSX.Element {
  const [logo, setLogo] = useState<string | null>(defaultValues.logo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettingsInput>({ resolver: zodResolver(storeSettingsSchema), defaultValues });

  async function onSubmit(data: StoreSettingsInput): Promise<void> {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, logo: logo ?? "" }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(payload.error ?? "Impossible d'enregistrer les paramètres.");
        return;
      }
      toast.success("Paramètres enregistrés.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <SingleImageUpload value={logo} onChange={setLogo} label="Logo de la boutique" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la boutique</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Devise (code ISO)</Label>
          <Input id="currency" {...register("currency")} />
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email de contact</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">Numéro WhatsApp (indicatif + numéro, chiffres uniquement)</Label>
          <Input id="whatsappNumber" placeholder="22966623182" {...register("whatsappNumber")} />
          {errors.whatsappNumber && <p className="text-sm text-destructive">{errors.whatsappNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="freeShippingThreshold">Livraison gratuite dès (FCFA)</Label>
          <Input
            id="freeShippingThreshold"
            type="number"
            min={0}
            {...register("freeShippingThreshold", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook</Label>
          <Input id="facebookUrl" {...register("facebookUrl")} />
          {errors.facebookUrl && <p className="text-sm text-destructive">{errors.facebookUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram</Label>
          <Input id="instagramUrl" {...register("instagramUrl")} />
          {errors.instagramUrl && <p className="text-sm text-destructive">{errors.instagramUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterUrl">X / Twitter</Label>
          <Input id="twitterUrl" {...register("twitterUrl")} />
          {errors.twitterUrl && <p className="text-sm text-destructive">{errors.twitterUrl.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
