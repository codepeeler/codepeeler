"use client";

import AdminCouponsPanel from "@/components/admin/AdminCouponsPanel";
import { useAdminCoupons } from "@/hooks/use-admin-coupons";

export default function AdminCouponsPage() {
  const coupons = useAdminCoupons();
  return (
    <AdminCouponsPanel
      coupons={coupons.coupons}
      loading={coupons.loading}
      pending={coupons.pending}
      onCreate={coupons.createCoupon}
      onToggle={coupons.toggleCoupon}
      onDelete={coupons.deleteCoupon}
    />
  );
}
