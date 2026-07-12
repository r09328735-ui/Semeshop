import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]),
  fullName: z.string().trim().min(2, "Nom complet requis.").max(100),
  phone: z.string().trim().min(6, "Numéro de téléphone invalide.").max(20),
  line1: z.string().trim().min(3, "Adresse requise.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Ville requise.").max(100),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Code postal requis.").max(20),
  country: z.string().trim().length(2, "Code pays ISO à 2 lettres (ex: FR)."),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
