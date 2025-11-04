"use client";

import { Button } from "@/components/ui/button";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Leaf } from "lucide-react";

interface RazorpayButtonProps {
  type: PaymentType;
  productType: ProductType;
  cartType: CartType;
  duration?: number;
  quantity?: number;
  area_id?: number;
  name?: string;
  occasion?: string;
  message?: string;
  plan_id?: number;
  tree_instance_id?: number;
  product_variant_id?: number;
  campaign_id?: number;
  coupon_id?: number;
  shippingAddressId?: number;
  label: string;
  productId?: number;
  amount?: number;
}

export default function RazorpayButton( {
  type,
  productType,
  cartType,
  shippingAddressId,
  label,
  productId,
  amount,
  plan_id,
  quantity,
  tree_instance_id,
  product_variant_id,
  campaign_id,
  coupon_id,
  // legacy/additional fields
  name,
  occasion,
  message,
  area_id,
}: RazorpayButtonProps ) {
  const { initiatePayment, loading } = useRazorpay();

  return (
    <Button
      onClick={ () =>
        initiatePayment(
          type,
          productType,
          cartType,
          shippingAddressId,
          productId,
          amount,
          {
            tree_instance_id,
            tree_plan_price_id: plan_id,
            product_variant_id,
            campaign_id,
            coupon_id,
            quantity,
            shipping_address_id: shippingAddressId,
            // Legacy fields
            name,
            occasion,
            message,
            location_id: area_id,
          },
        )
      }
      disabled={ loading }
      className="w-full"
    >
      <Leaf />
      { loading ? "Processing..." : label }
    </Button>
  );
}
