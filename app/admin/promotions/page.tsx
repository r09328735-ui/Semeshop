import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata: Metadata = { title: "Promotions — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage(): Promise<JSX.Element> {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Promotions</h1>
      <CouponManager
        initialCoupons={coupons.map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minPurchase: coupon.minPurchase,
          maxUses: coupon.maxUses,
          usedCount: coupon.usedCount,
          startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
          isActive: coupon.isActive,
        }))}
      />
    </div>
  );
}
