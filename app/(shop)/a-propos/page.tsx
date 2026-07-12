import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos" };

export default function AboutPage(): JSX.Element {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-6 text-3xl font-semibold">À propos de SemevoShop</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          SemevoShop est une boutique en ligne qui propose une sélection soigneusement choisie de
          produits, avec un objectif simple : vous offrir une expérience d&apos;achat fiable, rapide
          et agréable.
        </p>
        <p>
          Depuis notre création, nous mettons un point d&apos;honneur à travailler avec des
          fournisseurs de qualité et à garantir un service client réactif à chaque étape de votre
          commande, de la sélection du produit jusqu&apos;à la livraison chez vous.
        </p>
        <p>
          Notre équipe est à votre écoute pour toute question via notre{" "}
          <a href="/contact" className="text-foreground underline underline-offset-4">
            page de contact
          </a>
          .
        </p>
      </div>
    </div>
  );
}
