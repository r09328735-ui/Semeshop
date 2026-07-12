import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm(): JSX.Element {
  const whatsappUrl = getWhatsAppUrl(
    "Bonjour, j'ai oublié le mot de passe de mon compte SemevoShop. Pouvez-vous m'aider à le réinitialiser ?"
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Contactez-nous sur WhatsApp avec l&apos;email de votre compte, nous réinitialisons votre
          mot de passe manuellement et vous communiquons un nouveau mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full bg-[#25D366] hover:bg-[#1ebe5a]">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contacter le support sur WhatsApp
          </a>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
