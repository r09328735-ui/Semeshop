import { z } from "zod";

export const reviewSchema = z.object({
  orderItemId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().or(z.literal("")),
  comment: z.string().trim().min(5, "Votre avis doit contenir au moins 5 caractères.").max(2000),
  images: z.array(z.string()).max(4).optional().default([]),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
