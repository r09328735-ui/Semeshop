import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CgvPage(): JSX.Element {
  return (
    <div className="container max-w-3xl space-y-6 py-12 text-sm text-muted-foreground">
      <h1 className="text-3xl font-semibold text-foreground">Conditions générales de vente</h1>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">1. Objet</h2>
        <p>
          Les présentes conditions générales de vente régissent les relations contractuelles entre
          SemevoShop et ses clients dans le cadre de la vente en ligne de produits proposés sur le site.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">2. Prix</h2>
        <p>
          Les prix des produits sont indiqués en euros, toutes taxes comprises. SemevoShop se réserve le
          droit de modifier ses prix à tout moment, les produits étant facturés sur la base des tarifs
          en vigueur au moment de la validation de la commande.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">3. Commande</h2>
        <p>
          Toute commande passée sur le site vaut acceptation des présentes conditions générales de
          vente. Une confirmation de commande s&apos;affiche immédiatement et peut être discutée sur
          WhatsApp avec notre équipe.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">4. Paiement</h2>
        <p>
          Le paiement s&apos;effectue exclusivement à la livraison, en espèces ou par mobile money.
          Aucun paiement en ligne n&apos;est requis pour valider une commande.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">5. Livraison</h2>
        <p>
          Les délais de livraison sont indiqués à titre indicatif lors de la commande et peuvent
          varier selon le mode de livraison sélectionné.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">6. Droit de rétractation</h2>
        <p>
          Conformément à la législation en vigueur, vous disposez d&apos;un délai de 14 jours à
          compter de la réception de votre commande pour exercer votre droit de rétractation. Voir
          notre politique de retour pour plus de détails.
        </p>
      </section>
    </div>
  );
}
