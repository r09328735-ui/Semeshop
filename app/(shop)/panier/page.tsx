import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = { title: "Mon panier" };

export default function CartPage(): JSX.Element {
  return <CartPageContent />;
}
