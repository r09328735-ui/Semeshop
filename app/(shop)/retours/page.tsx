import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de retour" };

export default function ReturnPolicyPage(): JSX.Element {
  return (
    <div className="container max-w-3xl space-y-6 py-12 text-sm text-muted-foreground">
      <h1 className="text-3xl font-semibold text-foreground">Politique de retour</h1>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Délai de retour</h2>
        <p>
          Vous disposez de 14 jours à compter de la réception de votre commande pour nous retourner un
          article qui ne vous conviendrait pas.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Conditions</h2>
        <p>
          L&apos;article doit être retourné dans son état d&apos;origine, non porté et non lavé, avec
          son emballage d&apos;origine.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Comment procéder ?</h2>
        <p>
          Rendez-vous dans votre espace client, section &quot;Mes commandes&quot;, et contactez notre
          service client via la page de contact en indiquant le numéro de votre commande.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Remboursement</h2>
        <p>
          Une fois l&apos;article reçu et vérifié, le remboursement est effectué sur votre moyen de
          paiement d&apos;origine sous 5 à 10 jours ouvrés.
        </p>
      </section>
    </div>
  );
}
