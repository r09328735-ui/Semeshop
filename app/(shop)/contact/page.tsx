import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage(): Promise<JSX.Element> {
  const storeSettings = await prisma.storeSettings.findFirst();
  const whatsappUrl = getWhatsAppUrl(
    "Bonjour, j'ai une question à propos de SemevoShop.",
    storeSettings?.whatsappNumber ?? undefined
  );

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-2 text-3xl font-semibold">Contactez-nous</h1>
      <p className="mb-6 text-muted-foreground">
        Le plus rapide est de nous écrire directement sur WhatsApp, nous répondons en général en
        quelques minutes.
      </p>
      <Button asChild size="lg" className="mb-8 bg-[#25D366] hover:bg-[#1ebe5a]">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" />
          Discuter sur WhatsApp
        </a>
      </Button>
      <h2 className="mb-2 text-lg font-semibold">Ou envoyez-nous un message</h2>
      <ContactForm />
    </div>
  );
}
