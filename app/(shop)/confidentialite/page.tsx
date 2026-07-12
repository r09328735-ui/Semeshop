import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <div className="container max-w-3xl space-y-6 py-12 text-sm text-muted-foreground">
      <h1 className="text-3xl font-semibold text-foreground">Politique de confidentialité</h1>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Données collectées</h2>
        <p>
          Nous collectons les données que vous nous fournissez lors de la création de votre compte, de
          vos commandes et de vos échanges avec notre service client (nom, email, adresse, téléphone).
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Utilisation des données</h2>
        <p>
          Vos données sont utilisées exclusivement pour le traitement de vos commandes, la gestion de
          votre compte client et l&apos;amélioration de nos services. Elles ne sont jamais revendues à
          des tiers.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
          suppression de vos données personnelles. Vous pouvez exercer ces droits depuis votre espace
          client ou en nous contactant.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Sécurité</h2>
        <p>
          Vos mots de passe sont chiffrés et vos paiements sont traités de manière sécurisée par notre
          prestataire Stripe. Nous ne stockons jamais vos coordonnées bancaires.
        </p>
      </section>
    </div>
  );
}
