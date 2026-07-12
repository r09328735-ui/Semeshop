import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Le code doit contenir au moins 3 caractères.")
    .regex(/^[A-Z0-9-]+$/, "Le code ne doit contenir que des lettres, chiffres et tirets."),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0, "La valeur doit être positive."),
  minPurchase: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
