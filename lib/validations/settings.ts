import { z } from "zod";

export const storeSettingsSchema = z.object({
  name: z.string().trim().min(2, "Le nom de la boutique est requis.").max(100),
  logo: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Numéro WhatsApp invalide (chiffres uniquement, avec indicatif pays).")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  facebookUrl: z.string().trim().url("URL invalide.").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("URL invalide.").optional().or(z.literal("")),
  twitterUrl: z.string().trim().url("URL invalide.").optional().or(z.literal("")),
  currency: z.string().trim().length(3, "Code devise ISO à 3 lettres (ex: XOF).").default("XOF"),
  freeShippingThreshold: z.number().min(0).nullable().optional(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const shippingZoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  countries: z.array(z.string().trim().length(2)).min(1, "Ajoutez au moins un code pays."),
});

export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>;

export const shippingMethodSchema = z.object({
  shippingZoneId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  cost: z.number().min(0),
  estimatedDaysMin: z.number().int().min(0),
  estimatedDaysMax: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;

export const taxRateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  country: z.string().trim().length(2),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  rate: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
});

export type TaxRateInput = z.infer<typeof taxRateSchema>;
