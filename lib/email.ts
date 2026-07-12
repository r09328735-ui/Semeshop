import { Resend } from "resend";
import { PasswordResetEmail } from "@/emails/password-reset-email";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "Semeshop <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY manquant — lien de réinitialisation pour ${to} : ${resetUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Réinitialisation de votre mot de passe — Semeshop",
    react: PasswordResetEmail({ resetUrl }),
  });
}
