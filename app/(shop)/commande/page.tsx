import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Commande" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  const [addresses, shippingMethods] = await Promise.all([
    session?.user
      ? prisma.address.findMany({
          where: { userId: session.user.id, type: "SHIPPING" },
          orderBy: { isDefault: "desc" },
        })
      : Promise.resolve([]),
    prisma.shippingMethod.findMany({ where: { isActive: true }, orderBy: { cost: "asc" } }),
  ]);

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Finaliser ma commande</h1>
      <CheckoutForm
        addresses={addresses.map((address) => ({
          id: address.id,
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        }))}
        shippingMethods={shippingMethods.map((method) => ({
          id: method.id,
          name: method.name,
          description: method.description,
          cost: Number(method.cost),
          estimatedDaysMin: method.estimatedDaysMin,
          estimatedDaysMax: method.estimatedDaysMax,
        }))}
      />
    </div>
  );
}
