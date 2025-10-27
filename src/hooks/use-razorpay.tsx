"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";

/**
 * Arguments for initiating a payment with Razorpay.
 * This signature matches the existing <RazorpayButton /> usage.
 */
type InitiateArgs = [
  type: PaymentType,
  productType: ProductType,
  cartType: CartType,
  shippingAddressId?: number,
  productId?: number,
  amountInRupees?: number,
];

/**
 * Hook to handle Razorpay payment flows:
 * - Cart checkout: create order from cart, then initiate Razorpay
 * - Direct purchase: create direct order (buy now), then initiate Razorpay
 *
 * Endpoints (implemented via services):
 * - POST /orders
 * - POST /orders/direct
 * - POST /orders/{orderId}/payment/initiate
 * - POST /orders/{orderId}/payment/verify
 */
export function useRazorpay() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectToSuccess = useCallback(
    (
      razorpayOrderId: string,
      razorpayPaymentId: string,
      amountPaise: number,
    ) => {
      const amount = paymentService.paiseToRupees(amountPaise);
      router.push(
        `/payment/success?order_id=${encodeURIComponent(
          razorpayOrderId,
        )}&transaction_id=${encodeURIComponent(
          razorpayPaymentId,
        )}&amount=${encodeURIComponent(amount.toFixed(2))}`,
      );
    },
    [router],
  );

  const redirectToFailure = useCallback(
    (errorMessage: string, amountPaise?: number) => {
      const amountRupees =
        typeof amountPaise === "number"
          ? paymentService.paiseToRupees(amountPaise)
          : 0;

      router.push(
        `/payment/failure?error=${encodeURIComponent(
          errorMessage || "Payment failed",
        )}&amount=${encodeURIComponent(amountRupees.toFixed(2))}`,
      );
    },
    [router],
  );

  /**
   * Initiates the Razorpay payment flow.
   * Usage aligns with <RazorpayButton />:
   * initiatePayment(type, productType, cartType, shippingAddressId?, productId?, amountInRupees?)
   */
  const initiatePayment = useCallback(
    async (...args: InitiateArgs) => {
      const [
        type,
        productType,
        cartType,
        shippingAddressId,
        productId,
        // amountInRupees is currently unused for order creation;
        // backend calculates and returns the payable amount during initiation.
      ] = args;

      setLoading(true);

      try {
        // 1) Create order (cart or direct)
        let orderId: number | null = null;

        if (cartType === 1) {
          // From cart
          const orderRes = await orderService.createOrder({
            shipping_address_id: shippingAddressId,
            cart_type: 1,
          });

          orderId = orderRes?.data?.order?.id ?? null;
        } else if (cartType === 2) {
          // Direct (buy now)
          if (!productId && productType === 2) {
            throw new Error("Missing product ID for direct purchase.");
          }

          // Optional extra fields for the new /orders/direct schema
          const extra =
            (args as any[])[6] ||
            ({} as {
              tree_instance_id?: number;
              tree_plan_price_id?: number;
              product_variant_id?: number;
              campaign_id?: number;
              coupon_id?: number;
              quantity?: number;
            });

          const directRes = await orderService.createDirectOrder({
            // New v1 /orders/direct body
            item_type: productType === 1 ? "tree" : "product",

            // Tree direct purchase fields (when item_type === "tree")
            tree_instance_id: extra.tree_instance_id,
            tree_plan_price_id: extra.tree_plan_price_id,

            // E-commerce direct purchase fields (when item_type === "product")
            product_id: productType === 2 ? productId : undefined,
            product_variant_id: extra.product_variant_id,

            // Optional fields
            campaign_id: extra.campaign_id,
            quantity: typeof extra.quantity === "number" ? extra.quantity : 1,
            coupon_id: extra.coupon_id,
            shipping_address_id: shippingAddressId,
          });

          orderId = directRes?.data?.order?.id ?? null;
        } else {
          throw new Error("Invalid cart type.");
        }

        if (!orderId) {
          throw new Error("Failed to create order.");
        }

        // 2) Initiate Razorpay for the created order
        const init = await paymentService.initiatePayment(orderId);
        const {
          razorpay_order_id,
          amount: amountPaise,
          currency,
          key,
        } = init?.data || {};

        if (!razorpay_order_id || !amountPaise || !currency) {
          throw new Error("Invalid payment initiation response.");
        }

        const razorpayKey = key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "";

        if (!razorpayKey) {
          throw new Error(
            "Razorpay key missing. Configure NEXT_PUBLIC_RAZORPAY_KEY or return a key from backend.",
          );
        }

        // 3) Open Razorpay Checkout
        await paymentService.openRazorpayCheckout(
          {
            key: razorpayKey,
            amount: amountPaise,
            currency,
            order_id: razorpay_order_id,
            name: "My Tree Enviros",
            description: "Secure payment via Razorpay",
            prefill: {
              // Optionally prefill from user profile if available
            },
            theme: { color: "#0f766e" },
          },
          // Success handler
          async (response) => {
            try {
              const verifyRes = await paymentService.verifyPayment(orderId!, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes?.success) {
                redirectToSuccess(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  amountPaise,
                );
                return;
              }

              redirectToFailure("Payment verification failed.", amountPaise);
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Payment verification error.";
              redirectToFailure(msg, amountPaise);
            }
          },
          // Failure handler
          (error) => {
            const message =
              error?.description ||
              error?.reason ||
              error?.message ||
              "Payment failed.";
            redirectToFailure(message, amountPaise);
          },
        );
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || "Payment failed.";
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
