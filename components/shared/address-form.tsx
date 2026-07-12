"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressFormProps {
  type: "SHIPPING" | "BILLING";
  defaultValues?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function AddressForm({
  type,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer l'adresse",
  isSubmitting,
}: AddressFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { type, country: "FR", ...defaultValues },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Pays (code ISO, ex: FR)</Label>
        <Input id="country" maxLength={2} {...register("country")} />
        {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="line1">Adresse</Label>
        <Input id="line1" {...register("line1")} />
        {errors.line1 && <p className="text-sm text-destructive">{errors.line1.message}</p>}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="line2">Complément d&apos;adresse (optionnel)</Label>
        <Input id="line2" {...register("line2")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ville</Label>
        <Input id="city" {...register("city")} />
        {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Code postal</Label>
        <Input id="postalCode" {...register("postalCode")} />
        {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">Région / État (optionnel)</Label>
        <Input id="state" {...register("state")} />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <Checkbox id="isDefault" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="isDefault" className="cursor-pointer font-normal">
          Définir comme adresse par défaut
        </Label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
