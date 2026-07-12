import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage(): JSX.Element {
  return (
    <div className="container max-w-3xl space-y-6 py-12 text-sm text-muted-foreground">
      <h1 className="text-3xl font-semibold text-foreground">Mentions légales</h1>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Éditeur du site</h2>
        <p>
          SemevoShop — boutique en ligne.
          <br />
          Contact : contact@semevoshop.com
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Hébergement</h2>
        <p>Ce site est hébergé par un prestataire d&apos;hébergement web tiers.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, images, logos) sont la propriété
          exclusive de SemevoShop, sauf mention contraire, et ne peuvent être reproduits sans
          autorisation préalable.
        </p>
      </section>
    </div>
  );
}
