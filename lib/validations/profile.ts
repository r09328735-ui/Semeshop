import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
