import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().default(""),
  isMain: z.boolean().optional().default(false),
});

export const productVariantSchema = z.object({
  size: z.string().trim().optional().default(""),
  color: z.string().trim().optional().default(""),
  sku: z.string().trim().min(1, "SKU requis pour chaque variante."),
  stock: z.number().int().min(0),
  priceModifier: z.number(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets."),
  description: z.string().trim().min(1, "La description est requise."),
  price: z.number().min(0, "Le prix doit être positif."),
  compareAtPrice: z.number().min(0).nullable().optional(),
  sku: z.string().trim().min(1, "Le SKU est requis."),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight: z.number().min(0).nullable().optional(),
  length: z.number().min(0).nullable().optional(),
  width: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, "Choisissez au moins une catégorie."),
  images: z.array(productImageSchema),
  variants: z.array(productVariantSchema),
});

export type ProductInput = z.infer<typeof productSchema>;
