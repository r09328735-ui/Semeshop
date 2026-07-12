import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle2, Clock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const metadata: Metadata = { title: "Confirmation de commande" };
export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  params: { orderNumber: string };
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) notFound();

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: { items: true, shippingAddress: true, shippingMethod: true },
  });

  if (!order) notFound();

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="container max-w-2xl py-16">
      <ClearCartOnMount />
      <div className="flex flex-col items-center gap-3 text-center">
        {isPaid ? (
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        ) : (
          <Clock className="h-14 w-14 text-amber-500" />
        )}
        <h1 className="text-2xl font-semibold">
          {isPaid ? "Merci pour votre commande !" : "Paiement en cours de confirmation"}
        </h1>
        <p className="text-muted-foreground">
          Commande <strong>{order.orderNumber}</strong>{" "}
          {isPaid
            ? "confirmée. Un email récapitulatif vous a été envoyé."
            : "— nous confirmons votre paiement, cela peut prendre quelques instants."}
        </p>
      </div>

      <div className="mt-8 space-y-4 rounded-lg border p-6">
        <h2 className="font-semibold">Articles commandés</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatPrice(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Livraison ({order.shippingMethod?.name ?? "-"})</span>
            <span>{formatPrice(Number(order.shippingCost))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>{formatPrice(Number(order.taxAmount))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Remise</span>
              <span>-{formatPrice(Number(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/produits">Continuer mes achats</Link>
        </Button>
        <Button asChild>
          <Link href="/account/orders">Voir mes commandes</Link>
        </Button>
      </div>
    </div>
  );
}
