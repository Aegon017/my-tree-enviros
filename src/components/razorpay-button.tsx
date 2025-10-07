"use client";

import { Button } from "@/components/ui/button";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Leaf } from "lucide-react";

interface RazorpayButtonProps {
  type: PaymentType;
  productType: ProductType;
  cartType: CartType;
  shippingAddressId?: number;
  label: string;
  productId?: number;
  amount?: number;
}

export default function RazorpayButton({
  type,
  productType,
  cartType,
  shippingAddressId,
  label,
  productId,
  amount,
}: RazorpayButtonProps) {
  const { initiatePayment, loading } = useRazorpay();

  return (
    <Button
      onClick={() =>
        initiatePayment(
          type,
          productType,
          cartType,
          shippingAddressId,
          productId,
          amount,
        )
      }
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      <Leaf />
      {loading ? "Processing..." : label}
    </Button>
  );
}
