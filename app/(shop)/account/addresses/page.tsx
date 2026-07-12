import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressList } from "@/components/account/address-list";

export const metadata: Metadata = { title: "Mes adresses" };
export const dynamic = "force-dynamic";

export default async function AddressesPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <AddressList
      initialAddresses={addresses.map((address) => ({
        id: address.id,
        type: address.type,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state ?? "",
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      }))}
    />
  );
}
