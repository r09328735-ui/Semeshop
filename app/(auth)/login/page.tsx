import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage(): JSX.Element {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);
  return (
    <Suspense>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
