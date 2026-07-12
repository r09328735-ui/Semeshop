import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(100),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Jeton manquant."),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
