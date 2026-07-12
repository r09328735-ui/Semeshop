import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { ShippingManager } from "@/components/admin/shipping-manager";
import { TaxRateManager } from "@/components/admin/tax-rate-manager";

export const metadata: Metadata = { title: "Paramètres — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage(): Promise<JSX.Element> {
  const [storeSettings, shippingZones, taxRates] = await Promise.all([
    prisma.storeSettings.findFirst(),
    prisma.shippingZone.findMany({ orderBy: { createdAt: "asc" }, include: { methods: true } }),
    prisma.taxRate.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="livraison">Livraison</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <StoreSettingsForm
            defaultValues={{
              name: storeSettings?.name ?? "SemevoShop",
              logo: storeSettings?.logo ?? "",
              email: storeSettings?.email ?? "",
              phone: storeSettings?.phone ?? "",
              whatsappNumber: storeSettings?.whatsappNumber ?? "",
              address: storeSettings?.address ?? "",
              facebookUrl: storeSettings?.facebookUrl ?? "",
              instagramUrl: storeSettings?.instagramUrl ?? "",
              twitterUrl: storeSettings?.twitterUrl ?? "",
              currency: storeSettings?.currency ?? "XOF",
              freeShippingThreshold: storeSettings?.freeShippingThreshold ?? null,
            }}
          />
        </TabsContent>
        <TabsContent value="livraison">
          <ShippingManager
            initialZones={shippingZones.map((zone) => ({
              id: zone.id,
              name: zone.name,
              countries: zone.countries,
              methods: zone.methods.map((method) => ({
                id: method.id,
                name: method.name,
                description: method.description,
                cost: method.cost,
                estimatedDaysMin: method.estimatedDaysMin,
                estimatedDaysMax: method.estimatedDaysMax,
                isActive: method.isActive,
              })),
            }))}
          />
        </TabsContent>
        <TabsContent value="taxes">
          <TaxRateManager
            initialTaxRates={taxRates.map((taxRate) => ({
              id: taxRate.id,
              name: taxRate.name,
              country: taxRate.country,
              state: taxRate.state,
              rate: taxRate.rate,
              isActive: taxRate.isActive,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
