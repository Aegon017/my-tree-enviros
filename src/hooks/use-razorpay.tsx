"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";
import { orderService } from "@/services/order.services";
import { paymentService } from "@/services/payment.services";

type DirectExtras = {
  tree_plan_price_id?: number;
  product_variant_id?: number;
  campaign_id?: number;
  quantity?: number;
  coupon_id?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
};

type InitiateArgs = [
  type: PaymentType,
  productType: ProductType,
  cartType: CartType,
  shippingAddressId?: number | null,
  productId?: number,
  amountInRupees?: number,
  extras?: DirectExtras,
];

export function useRazorpay() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectToSuccess = useCallback(
    (razorpayOrderId: string, razorpayPaymentId: string, amountPaise: number, internalOrderId?: number) => {
      const amount = paymentService.paiseToRupees(amountPaise);
      const params = new URLSearchParams();
      params.set("order_id", razorpayOrderId);
      params.set("transaction_id", razorpayPaymentId);
      params.set("amount", amount.toFixed(2));
      if (typeof internalOrderId === "number") {
        params.set("internal_order_id", String(internalOrderId));
      }
      router.push(`/payment/success?${params.toString()}`);
    },
    [router],
  );

  const redirectToFailure = useCallback(
    (errorMessage: string, amountPaise?: number) => {
      const amountRupees = typeof amountPaise === "number" ? paymentService.paiseToRupees(amountPaise) : 0;
      router.push(`/payment/failure?error=${encodeURIComponent(errorMessage || "Payment failed")}&amount=${encodeURIComponent(amountRupees.toFixed(2))}`);
    },
    [router],
  );

  const initiatePayment = useCallback(
    async (...args: InitiateArgs) => {
      const [type, productType, cartType, shippingAddressId, productId, , extras] = args;

      setLoading(true);

      try {
        let orderId: number | null = null;

        if (cartType === 1) {
          const payload: any = {};
          if (shippingAddressId && shippingAddressId > 0) {
            payload.shipping_address_id = shippingAddressId;
          }

          const orderRes = await orderService.createOrder(payload);
          orderId = orderRes?.data?.order?.id ?? null;
        } else if (cartType === 2) {
          const extra: DirectExtras = (extras as DirectExtras) || {};

          const directPayload: any = {
            item_type: productType === 1 ? "tree" : "campaign",
          };

          if (productType === 1) {
            directPayload.tree_plan_price_id = extra.tree_plan_price_id;
            directPayload.name = extra.name;
            directPayload.occasion = extra.occasion;
            directPayload.message = extra.message;
            directPayload.location_id = extra.location_id;
          } else {
            directPayload.campaign_id = extra.campaign_id;
            directPayload.quantity = typeof extra.quantity === "number" ? extra.quantity : 1;
          }

          if (shippingAddressId && shippingAddressId > 0) {
            directPayload.shipping_address_id = shippingAddressId;
          }

          if (extra.coupon_id) {
            directPayload.coupon_id = extra.coupon_id;
          }

          const directRes = await orderService.createDirectOrder(directPayload);
          orderId = directRes?.data?.order?.id ?? null;
        } else {
          throw new Error("Invalid cart type.");
        }

        if (!orderId) {
          throw new Error("Failed to create order.");
        }

        const init = await paymentService.initiatePayment(orderId);
        const { razorpay_order_id, amount: amountPaise, currency, key, is_free } = init?.data || {};

        if (is_free) {
          redirectToSuccess("FREE", "FREE", 0, orderId);
          return;
        }

        if (!razorpay_order_id || !amountPaise || !currency) {
          throw new Error("Invalid payment initiation response.");
        }

        const razorpayKey = key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "";

        if (!razorpayKey) {
          throw new Error("Razorpay key missing. Configure NEXT_PUBLIC_RAZORPAY_KEY or return a key from backend.");
        }

        await paymentService.openRazorpayCheckout(
          {
            key: razorpayKey,
            amount: amountPaise,
            currency,
            order_id: razorpay_order_id,
            name: "My Tree Enviros",
            description: "Secure payment via Razorpay",
            prefill: {},
            theme: { color: "#0f766e" },
          },
          async (response) => {
            try {
              const verifyRes = await paymentService.verifyPayment(orderId!, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes?.success) {
                redirectToSuccess(response.razorpay_order_id, response.razorpay_payment_id, amountPaise, orderId ?? undefined);
                return;
              }

              redirectToFailure("Payment verification failed.", amountPaise);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Payment verification error.";
              redirectToFailure(msg, amountPaise);
            }
          },
          (error) => {
            const message = error?.description || error?.reason || error?.message || "Payment failed.";
            redirectToFailure(message, amountPaise);
          },
        );
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Payment failed.";
        toast.error(message);
        redirectToFailure(message);
      } finally {
        setLoading(false);
      }
    },
    [redirectToFailure, redirectToSuccess],
  );

  return { initiatePayment, loading };
}

export default useRazorpay;
