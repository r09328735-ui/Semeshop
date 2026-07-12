import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(100),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  subject: z.string().trim().min(3, "Le sujet doit contenir au moins 3 caractères.").max(150),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères.").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
