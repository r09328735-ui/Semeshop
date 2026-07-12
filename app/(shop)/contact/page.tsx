import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage(): JSX.Element {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-2 text-3xl font-semibold">Contactez-nous</h1>
      <p className="mb-8 text-muted-foreground">
        Une question, un problème avec votre commande ? Écrivez-nous, nous vous répondrons rapidement.
      </p>
      <ContactForm />
    </div>
  );
}
