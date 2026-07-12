import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
