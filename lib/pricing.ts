import { prisma } from "@/lib/prisma";
import type { Coupon, ShippingMethod } from "@prisma/client";

export interface CartLineInput {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  variantId: string | null;
  name: string;
  image: string | null;
  sku: string;
  price: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
}

export interface PriceCartResult {
  lines: PricedLine[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  coupon: Coupon | null;
  shippingMethod: ShippingMethod | null;
  errors: string[];
}

interface PriceCartOptions {
  couponCode?: string | null;
  shippingMethodId?: string | null;
  country?: string | null;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CMD-${datePart}-${randomPart}`;
}

export async function priceCart(
  items: CartLineInput[],
  { couponCode, shippingMethodId, country }: PriceCartOptions = {}
): Promise<PriceCartResult> {
  const errors: string[] = [];

  if (items.length === 0) {
    return {
      lines: [],
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      coupon: null,
      shippingMethod: null,
      errors: ["Le panier est vide."],
    };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true, images: { orderBy: { position: "asc" }, take: 1 } },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  const lines: PricedLine[] = [];

  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product) {
      errors.push("Un article de votre panier n'existe plus.");
      continue;
    }
    if (product.status !== "PUBLISHED") {
      errors.push(`${product.name} n'est plus disponible à la vente.`);
      continue;
    }

    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    if (item.variantId && !variant) {
      errors.push(`Une variante de ${product.name} n'existe plus.`);
      continue;
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (item.quantity > availableStock) {
      errors.push(
        availableStock > 0
          ? `Il ne reste que ${availableStock} exemplaire(s) de ${product.name}.`
          : `${product.name} est en rupture de stock.`
      );
      continue;
    }

    const price = Number(product.price) + (variant ? Number(variant.priceModifier) : 0);
    const variantLabel = variant ? [variant.size, variant.color].filter(Boolean).join(" / ") : "";

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
      image: product.images[0]?.url ?? null,
      sku: variant?.sku ?? product.sku,
      price,
      quantity: item.quantity,
      lineTotal: Math.round(price * item.quantity * 100) / 100,
      availableStock,
    });
  }

  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;

  let shippingMethod: ShippingMethod | null = null;
  let shippingCost = 0;
  if (shippingMethodId) {
    shippingMethod = await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } });
    if (!shippingMethod || !shippingMethod.isActive) {
      errors.push("Le mode de livraison sélectionné n'est plus disponible.");
      shippingMethod = null;
    } else {
      shippingCost = Number(shippingMethod.cost);
    }
  }

  const storeSettings = await prisma.storeSettings.findFirst();
  if (
    shippingMethod &&
    storeSettings?.freeShippingThreshold &&
    subtotal >= Number(storeSettings.freeShippingThreshold)
  ) {
    shippingCost = 0;
  }

  let taxAmount = 0;
  if (country) {
    const taxRate = await prisma.taxRate.findFirst({
      where: { isActive: true, country },
      orderBy: { state: "desc" },
    });
    if (taxRate) {
      taxAmount = Math.round(subtotal * (Number(taxRate.rate) / 100) * 100) / 100;
    }
  }

  let coupon: Coupon | null = null;
  let discountAmount = 0;
  if (couponCode) {
    const found = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    const now = new Date();
    if (!found || !found.isActive) {
      errors.push("Ce code promo n'est pas valide.");
    } else if (found.startsAt && found.startsAt > now) {
      errors.push("Ce code promo n'est pas encore actif.");
    } else if (found.expiresAt && found.expiresAt < now) {
      errors.push("Ce code promo a expiré.");
    } else if (found.maxUses !== null && found.usedCount >= found.maxUses) {
      errors.push("Ce code promo a atteint son nombre maximal d'utilisations.");
    } else if (found.minPurchase && subtotal < Number(found.minPurchase)) {
      errors.push(`Ce code promo nécessite un minimum d'achat de ${Number(found.minPurchase)} €.`);
    } else {
      coupon = found;
      discountAmount =
        found.type === "PERCENTAGE"
          ? Math.round(subtotal * (Number(found.value) / 100) * 100) / 100
          : Math.min(Number(found.value), subtotal);
    }
  }

  const total = Math.max(0, Math.round((subtotal + shippingCost + taxAmount - discountAmount) * 100) / 100);

  return { lines, subtotal, shippingCost, taxAmount, discountAmount, total, coupon, shippingMethod, errors };
}
