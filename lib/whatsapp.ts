export const DEFAULT_WHATSAPP_NUMBER = "22966623182"; // format international, chiffres uniquement

export function getWhatsAppUrl(message: string, phone: string = DEFAULT_WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
