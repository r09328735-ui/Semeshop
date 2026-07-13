import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PRODUCT_SLUGS = [
  "t-shirt-coton-bio",
  "veste-en-jean",
  "ecouteurs-sans-fil",
  "montre-connectee",
  "chargeur-rapide-usb-c",
  "coussin-decoratif",
  "lampe-de-bureau-led",
  "tapis-de-yoga",
  "gourde-isotherme-1l",
];

const TEST_CLIENT_EMAIL = "client@semevoshop.com";

async function main(): Promise<void> {
  const demoProducts = await prisma.product.findMany({
    where: { slug: { in: DEMO_PRODUCT_SLUGS } },
    select: { id: true },
  });
  const demoProductIds = demoProducts.map((p) => p.id);

  if (demoProductIds.length > 0) {
    // Product a onDelete: Cascade vers ProductImage/ProductVariant/ProductCategory/
    // Review/WishlistItem/CartItem. OrderItem garde un snapshot (name/price/sku)
    // et n'est pas affecté par la suppression du produit.
    await prisma.product.deleteMany({ where: { id: { in: demoProductIds } } });
    console.log(`${demoProductIds.length} produit(s) de démo supprimé(s).`);
  } else {
    console.log("Aucun produit de démo trouvé (déjà nettoyé ?).");
  }

  const testClient = await prisma.user.findUnique({ where: { email: TEST_CLIENT_EMAIL } });
  if (testClient) {
    const orders = await prisma.order.findMany({ where: { userId: testClient.id }, select: { id: true } });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    await prisma.review.deleteMany({ where: { userId: testClient.id } });
    await prisma.wishlistItem.deleteMany({ where: { userId: testClient.id } });
    await prisma.cartItem.deleteMany({ where: { userId: testClient.id } });
    await prisma.address.deleteMany({ where: { userId: testClient.id } });
    await prisma.session.deleteMany({ where: { userId: testClient.id } });
    await prisma.account.deleteMany({ where: { userId: testClient.id } });
    await prisma.user.delete({ where: { id: testClient.id } });
    console.log("Compte client de test supprimé (client@semevoshop.com).");
  } else {
    console.log("Compte client de test introuvable (déjà supprimé ?).");
  }

  console.log("Nettoyage terminé. Le compte admin (admin@semevoshop.com) a été conservé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
