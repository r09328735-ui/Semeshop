import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_COUNT = 8;

function image(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `/images/placeholder-${hash % PLACEHOLDER_COUNT}.svg`;
}

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash("Admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@semevoshop.com" },
    update: {},
    create: { name: "Administrateur", email: "admin@semevoshop.com", password: adminPassword, role: "ADMIN" },
  });

  const customerPassword = await bcrypt.hash("Client1234", 12);
  await prisma.user.upsert({
    where: { email: "client@semevoshop.com" },
    update: {},
    create: { name: "Client Test", email: "client@semevoshop.com", password: customerPassword, role: "USER" },
  });

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "SemevoShop",
      email: "contact@semevoshop.com",
      phone: "+229 66 62 31 82",
      whatsappNumber: "22966623182",
      address: "Cotonou, Bénin",
      currency: "EUR",
      freeShippingThreshold: 80,
    },
  });

  async function upsertCategory(data: { name: string; slug: string; description: string; position: number }) {
    return prisma.category.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, image: image(data.slug) },
    });
  }

  const vetements = await upsertCategory({
    name: "Vêtements",
    slug: "vetements",
    description: "Mode homme et femme.",
    position: 0,
  });
  const electronique = await upsertCategory({
    name: "Électronique",
    slug: "electronique",
    description: "Gadgets et accessoires high-tech.",
    position: 1,
  });
  const maison = await upsertCategory({
    name: "Maison",
    slug: "maison",
    description: "Décoration et articles pour la maison.",
    position: 2,
  });
  const sport = await upsertCategory({
    name: "Sport",
    slug: "sport",
    description: "Équipements et accessoires sportifs.",
    position: 3,
  });

  const productsData = [
    {
      name: "T-shirt en coton bio",
      slug: "t-shirt-coton-bio",
      description:
        "<p>Un t-shirt confortable en coton biologique, coupe classique, disponible en plusieurs tailles et couleurs.</p>",
      price: 24.9,
      compareAtPrice: 29.9,
      sku: "TSHIRT-COTON",
      stock: 0,
      categoryId: vetements.id,
      isFeatured: true,
      variants: [
        { size: "S", color: "Blanc", sku: "TSHIRT-COTON-S-BLC", stock: 12 },
        { size: "M", color: "Blanc", sku: "TSHIRT-COTON-M-BLC", stock: 8 },
        { size: "L", color: "Blanc", sku: "TSHIRT-COTON-L-BLC", stock: 5 },
        { size: "S", color: "Noir", sku: "TSHIRT-COTON-S-NOI", stock: 10 },
        { size: "M", color: "Noir", sku: "TSHIRT-COTON-M-NOI", stock: 0 },
      ],
    },
    {
      name: "Veste en jean",
      slug: "veste-en-jean",
      description: "<p>Veste en jean intemporelle, parfaite pour toutes les saisons.</p>",
      price: 59.9,
      compareAtPrice: null,
      sku: "VESTE-JEAN",
      stock: 15,
      categoryId: vetements.id,
      isFeatured: false,
      variants: [],
    },
    {
      name: "Écouteurs sans fil",
      slug: "ecouteurs-sans-fil",
      description:
        "<p>Écouteurs Bluetooth avec réduction de bruit active, autonomie 24h avec le boîtier de charge.</p>",
      price: 79.9,
      compareAtPrice: 99.9,
      sku: "ECOUTEURS-BT",
      stock: 30,
      categoryId: electronique.id,
      isFeatured: true,
      variants: [],
    },
    {
      name: "Montre connectée",
      slug: "montre-connectee",
      description: "<p>Suivez votre activité, votre sommeil et vos notifications au poignet.</p>",
      price: 129.0,
      compareAtPrice: null,
      sku: "MONTRE-CO",
      stock: 3,
      categoryId: electronique.id,
      isFeatured: true,
      variants: [],
    },
    {
      name: "Chargeur rapide USB-C",
      slug: "chargeur-rapide-usb-c",
      description: "<p>Chargeur secteur 30W compatible avec la plupart des smartphones et tablettes.</p>",
      price: 19.9,
      compareAtPrice: null,
      sku: "CHARGEUR-USBC",
      stock: 50,
      categoryId: electronique.id,
      isFeatured: false,
      variants: [],
    },
    {
      name: "Coussin décoratif",
      slug: "coussin-decoratif",
      description: "<p>Coussin doux en velours, disponible en plusieurs coloris pour égayer votre salon.</p>",
      price: 22.5,
      compareAtPrice: null,
      sku: "COUSSIN-DECO",
      stock: 0,
      categoryId: maison.id,
      isFeatured: false,
      variants: [
        { size: null, color: "Bleu", sku: "COUSSIN-DECO-BLEU", stock: 7 },
        { size: null, color: "Terracotta", sku: "COUSSIN-DECO-TERRA", stock: 0 },
      ],
    },
    {
      name: "Lampe de bureau LED",
      slug: "lampe-de-bureau-led",
      description: "<p>Lampe de bureau à intensité réglable avec port de charge USB intégré.</p>",
      price: 34.9,
      compareAtPrice: 44.9,
      sku: "LAMPE-LED",
      stock: 18,
      categoryId: maison.id,
      isFeatured: false,
      variants: [],
    },
    {
      name: "Tapis de yoga",
      slug: "tapis-de-yoga",
      description: "<p>Tapis de yoga antidérapant, épaisseur 6mm, avec sangle de transport.</p>",
      price: 29.9,
      compareAtPrice: null,
      sku: "TAPIS-YOGA",
      stock: 25,
      categoryId: sport.id,
      isFeatured: true,
      variants: [],
    },
    {
      name: "Gourde isotherme 1L",
      slug: "gourde-isotherme-1l",
      description: "<p>Gourde en inox, garde vos boissons fraîches 24h ou chaudes 12h.</p>",
      price: 17.9,
      compareAtPrice: null,
      sku: "GOURDE-1L",
      stock: 40,
      categoryId: sport.id,
      isFeatured: false,
      variants: [],
    },
  ];

  for (const productData of productsData) {
    const { categoryId, variants, ...data } = productData;

    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        status: "PUBLISHED",
        weight: 0.5,
        images: {
          create: [0, 1, 2].map((index) => ({
            url: image(`${data.slug}-${index}`),
            alt: data.name,
            position: index,
            isMain: index === 0,
          })),
        },
        categories: { create: [{ categoryId }] },
        variants: { create: variants },
      },
    });

    if (variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      await prisma.product.update({ where: { id: product.id }, data: { stock: totalStock } });
    }
  }

  const shippingZone = await prisma.shippingZone.upsert({
    where: { id: "zone-france" },
    update: {},
    create: { id: "zone-france", name: "France métropolitaine", countries: ["FR"] },
  });

  await prisma.shippingMethod.upsert({
    where: { id: "shipping-standard" },
    update: {},
    create: {
      id: "shipping-standard",
      shippingZoneId: shippingZone.id,
      name: "Livraison standard",
      description: "Livraison à domicile",
      cost: 4.9,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
    },
  });

  await prisma.shippingMethod.upsert({
    where: { id: "shipping-express" },
    update: {},
    create: {
      id: "shipping-express",
      shippingZoneId: shippingZone.id,
      name: "Livraison express",
      description: "Livraison rapide sous 48h",
      cost: 9.9,
      estimatedDaysMin: 1,
      estimatedDaysMax: 2,
    },
  });

  await prisma.taxRate.upsert({
    where: { id: "tva-fr" },
    update: {},
    create: { id: "tva-fr", name: "TVA France", country: "FR", rate: 20, isActive: true },
  });

  await prisma.coupon.upsert({
    where: { code: "BIENVENUE10" },
    update: {},
    create: {
      code: "BIENVENUE10",
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 20,
      maxUses: 100,
      isActive: true,
    },
  });

  console.log("Seed terminé.");
  console.log("Compte admin : admin@semevoshop.com / Admin1234");
  console.log("Compte client : client@semevoshop.com / Client1234");
  console.log("Code promo : BIENVENUE10 (-10%, achat minimum 20€)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
