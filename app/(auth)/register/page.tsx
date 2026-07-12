import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage(): JSX.Element {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);
  return <RegisterForm googleEnabled={googleEnabled} />;
}
