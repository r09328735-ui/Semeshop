import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Standard PDF fonts only support the WinAnsi encoding, which chokes on the
// narrow no-break spaces Intl.NumberFormat uses for thousands separators —
// so invoice amounts are formatted manually here instead of via formatPrice.
function formatAmount(value: number): string {
  const rounded = Math.round(value);
  const withSeparators = rounded.toLocaleString("en-US").replace(/,/g, " ");
  return `${withSeparators} FCFA`;
}

function formatInvoiceDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" })
    .format(date)
    .replace(/[\u202f\u00a0]/g, " ");
}

export interface InvoiceItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface InvoiceAddress {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface InvoiceData {
  storeName: string;
  storePhone: string | null;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: InvoiceAddress;
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;

export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const gray = rgb(0.45, 0.45, 0.45);
  const black = rgb(0.1, 0.1, 0.1);
  const lineColor = rgb(0.85, 0.85, 0.85);

  let y = PAGE_HEIGHT - 60;

  page.drawText(data.storeName, { x: MARGIN_X, y, size: 20, font: bold, color: black });
  if (data.storePhone) {
    page.drawText(`WhatsApp : ${data.storePhone}`, {
      x: PAGE_WIDTH - MARGIN_X - 160,
      y,
      size: 10,
      font,
      color: gray,
    });
  }
  y -= 34;

  page.drawText(`Facture — Commande ${data.orderNumber}`, { x: MARGIN_X, y, size: 13, font: bold, color: black });
  y -= 16;
  page.drawText(`Date : ${formatInvoiceDate(data.createdAt)}`, { x: MARGIN_X, y, size: 10, font, color: gray });
  y -= 30;

  page.drawText("Facturé à", { x: MARGIN_X, y, size: 10, font: bold, color: black });
  y -= 14;
  const addressLines = [
    data.shippingAddress.fullName,
    data.shippingAddress.line1,
    data.shippingAddress.line2 ?? "",
    `${data.shippingAddress.postalCode} ${data.shippingAddress.city}`.trim(),
    data.shippingAddress.country,
    data.shippingAddress.phone,
  ].filter(Boolean);
  for (const line of addressLines) {
    page.drawText(line, { x: MARGIN_X, y, size: 10, font, color: black });
    y -= 13;
  }

  y -= 20;

  const colName = MARGIN_X;
  const colQty = 340;
  const colPrice = 400;
  const colTotal = 480;

  page.drawText("Article", { x: colName, y, size: 9, font: bold, color: black });
  page.drawText("Qté", { x: colQty, y, size: 9, font: bold, color: black });
  page.drawText("Prix", { x: colPrice, y, size: 9, font: bold, color: black });
  page.drawText("Total", { x: colTotal, y, size: 9, font: bold, color: black });
  y -= 6;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 1, color: lineColor });
  y -= 16;

  for (const item of data.items) {
    const truncatedName = item.name.length > 42 ? `${item.name.slice(0, 39)}...` : item.name;
    page.drawText(truncatedName, { x: colName, y, size: 9, font, color: black });
    page.drawText(String(item.quantity), { x: colQty, y, size: 9, font, color: black });
    page.drawText(formatAmount(item.price), { x: colPrice, y, size: 9, font, color: black });
    page.drawText(formatAmount(item.price * item.quantity), { x: colTotal, y, size: 9, font, color: black });
    y -= 16;
  }

  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 1, color: lineColor });
  y -= 22;

  const totals: [string, number][] = [
    ["Sous-total", data.subtotal],
    ["Livraison", data.shippingCost],
    ["Taxes", data.taxAmount],
  ];
  if (data.discountAmount > 0) {
    totals.push(["Remise", -data.discountAmount]);
  }

  for (const [label, value] of totals) {
    page.drawText(label, { x: colPrice, y, size: 10, font, color: gray });
    page.drawText(formatAmount(value), { x: colTotal, y, size: 10, font, color: black });
    y -= 16;
  }

  y -= 4;
  page.drawLine({ start: { x: colPrice, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 1, color: lineColor });
  y -= 18;
  page.drawText("Total à payer", { x: colPrice, y, size: 11, font: bold, color: black });
  page.drawText(formatAmount(data.total), { x: colTotal, y, size: 11, font: bold, color: black });

  y -= 40;
  page.drawText("Paiement à la livraison, en espèces ou par mobile money.", {
    x: MARGIN_X,
    y,
    size: 9,
    font,
    color: gray,
  });

  return doc.save();
}
