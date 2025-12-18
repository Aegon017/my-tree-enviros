"use client";

import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkoutService } from "@/modules/checkout/services/checkout.service";
import { ordersService } from "@/modules/orders/services/orders.service";
import { paymentService } from "@/modules/payments/services/payments.service";

interface Props {
  mode: "cart" | "buy_now";
  label: string;
  summary?: any;
  coupon_code?: string;
  productType?: any;
  plan_id?: number;
  quantity?: number;
  campaign_id?: number;
  name?: string;
  occasion?: string;
  message?: string;
  area_id?: number;
  shipping_address_id?: number;
}

export default function RazorpayButton({
  mode,
  label,
  summary,
  coupon_code,
  productType,
  plan_id,
  quantity,
  campaign_id,
  name,
  occasion,
  message,
  area_id,
  shipping_address_id,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayNow = async () => {
    setLoading(true);
    try {
      let order;
      let payment;

      if (mode === "cart") {
        const payload = {
          coupon_code,
          shipping_address_id,
          items: summary.items.map((i: any) => ({
            type: i.type,
            quantity: i.quantity,
            amount: i.price,
            product_variant_id: i.product_variant_id,
            tree_id: i.tree?.id,
            plan_id: i.plan?.id,
            plan_price_id: i.plan_price_id,
          })),
        };

        const res = await checkoutService.prepare(payload);
        const data = (res as any).data || res;
        order = data.order;
        payment = data.payment;
      } else {
        const res = await ordersService.createDirectOrder({
          item_type: productType,
          campaign_id,
          amount: summary.grand_total,
          quantity: quantity || 1,
          tree_plan_price_id: plan_id,
          coupon_id: coupon_code,
          name,
          occasion,
          message,
          location_id: area_id,
        });

        const data = (res as any).data || res;
        order = data.order;
        payment = data.payment;
      }

      await paymentService.loadRazorpayScript();
      await paymentService.openRazorpayCheckout(
        {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.order_id,
          name: "MyTree Enviros",
          description: `Order #${order.reference_number}`,
        },
        async (response: any) => {
          await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_reference: order.reference_number,
          });

          router.push(`/payment/success?order_id=${order.id}`);
        },
        () => {
          router.push("/payment/failure");
        },
      );
    } catch (e: any) {
      toast.error(e?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" disabled={loading} onClick={handlePayNow}>
      <Leaf className="mr-2 h-4 w-4" />
      {loading ? "Processing..." : label}
    </Button>
  );
}
