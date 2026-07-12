import Link from "next/link";

export function Footer({ siteName }: { siteName: string }): JSX.Element {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold">{siteName}</h3>
          <p className="text-sm text-muted-foreground">Votre boutique en ligne pour tous vos besoins.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Boutique</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/produits" className="hover:text-foreground">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link href="/a-propos" className="hover:text-foreground">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Aide</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/retours" className="hover:text-foreground">
                Politique de retour
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-foreground">
                Suivre ma commande
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Légal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/cgv" className="hover:text-foreground">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="hover:text-foreground">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-foreground">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteName}. Tous droits réservés.
      </div>
    </footer>
  );
}
