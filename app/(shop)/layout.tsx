import { prisma } from "@/lib/prisma";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export const revalidate = 60;

export default async function ShopLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const [categories, storeSettings] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { position: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.storeSettings.findFirst(),
  ]);

  const siteName = storeSettings?.name ?? "Semeshop";

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer siteName={siteName} />
    </div>
  );
}
