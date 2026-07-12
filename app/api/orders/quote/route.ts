import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/validations/order";
import { priceCart } from "@/lib/pricing";

export async function POST(req: Request): Promise<NextResponse> {
  const body: unknown = await req.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const result = await priceCart(parsed.data.items, {
    couponCode: parsed.data.couponCode,
    shippingMethodId: parsed.data.shippingMethodId,
    country: parsed.data.country,
  });

  return NextResponse.json(result);
}
