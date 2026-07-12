import { prisma } from "@/lib/prisma";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

// Rendu dynamique pour tout le groupe (shop) : le header/footer dépendent de
// données DB (catégories, paramètres boutique) qui doivent rester à jour à
// chaque requête, et cela évite d'exiger une connexion DB au moment du build.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const [categories, storeSettings] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { position: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.storeSettings.findFirst(),
  ]);

  const siteName = storeSettings?.name ?? "SemevoShop";

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer siteName={siteName} />
      <WhatsAppButton phone={storeSettings?.whatsappNumber} />
    </div>
  );
}
