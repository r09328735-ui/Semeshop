import { z } from "zod";
import { addressSchema } from "@/lib/validations/address";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const quoteSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Le panier est vide."),
  shippingMethodId: z.string().nullable().optional(),
  couponCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Le panier est vide."),
  shippingAddressId: z.string().min(1).optional(),
  billingAddressId: z.string().min(1).optional(),
  newShippingAddress: addressSchema.partial({ type: true }).optional(),
  billingSameAsShipping: z.boolean().default(true),
  newBillingAddress: addressSchema.partial({ type: true }).optional(),
  shippingMethodId: z.string().min(1, "Choisissez un mode de livraison."),
  couponCode: z.string().nullable().optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
