import { Resend } from "resend";
import { PasswordResetEmail } from "@/emails/password-reset-email";
import { OrderConfirmationEmail } from "@/emails/order-confirmation-email";

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

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export async function sendOrderConfirmationEmail(to: string, order: OrderConfirmationData): Promise<void> {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/account/orders/${order.orderNumber}`;

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY manquant — confirmation de commande ${order.orderNumber} pour ${to}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Confirmation de votre commande ${order.orderNumber} — Semeshop`,
    react: OrderConfirmationEmail({ ...order, trackingUrl }),
  });
}
