"use client";

import { Button } from "@/components/ui/button";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Leaf } from "lucide-react";

interface RazorpayButtonProps {
  type: PaymentType;
  productType: ProductType;
  cartType: CartType;
  shippingAddressId?: number | null;
  label: string;
  productId?: number;
  amount?: number;
  plan_id?: number;
  quantity?: number;
  campaign_id?: number;
  coupon_id?: number;
  name?: string;
  occasion?: string;
  message?: string;
  area_id?: number;
}

export default function RazorpayButton({
  type,
  productType,
  cartType,
  shippingAddressId,
  label,
  productId,
  amount,
  plan_id,
  quantity,
  campaign_id,
  coupon_id,
  name,
  occasion,
  message,
  area_id,
}: RazorpayButtonProps) {
  const { initiatePayment, loading } = useRazorpay();

  return (
    <Button
      onClick={() =>
        initiatePayment(type, productType, cartType, shippingAddressId, productId, amount, {
          tree_plan_price_id: plan_id,
          campaign_id,
          coupon_id,
          quantity,
          name,
          occasion,
          message,
          location_id: area_id,
        })
      }
      disabled={loading}
      className="w-full"
    >
      <Leaf />
      {loading ? "Processing..." : label}
    </Button>
  );
}
