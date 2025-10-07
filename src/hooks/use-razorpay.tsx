import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { loadRazorpay } from "@/lib/razorpay";
import type { CartType, PaymentType, ProductType } from "@/types/payment.type";

interface CheckoutPayload {
  currency: string;
  type: PaymentType;
  product_type: ProductType;
  cart_type: CartType;
  shipping_address_id: number;
  product_id?: number;
  amount?: number;
}

interface CheckoutResponse {
  order_id: string;
  amount: number;
  currency: string;
}

interface CallbackPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type: PaymentType;
}

interface CallbackResponse {
  success: boolean;
  message: string;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (
    type: PaymentType,
    productType: ProductType,
    cartType: CartType,
    shippingAddressId?: number,
    productId?: number,
    amount?: number,
  ) => {
    setLoading(true);

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        toast.error("Payment service unavailable");
        return;
      }

      const payload: CheckoutPayload = {
        currency: "INR",
        type,
        product_type: productType,
        cart_type: cartType,
        shipping_address_id: shippingAddressId || 0,
      };

      if (cartType === 2) {
        payload.product_id = productId;
        payload.amount = amount;
      }

      const res = await api.post<CheckoutResponse>("/api/checkout", payload);

      const response = res.data;

      if (!response.data?.amount || !response.data?.razorpay_order_id) {
        throw new Error("Invalid response from server");
      }

      const {
        razorpay_order_id: order_id,
        amount: orderAmount,
        currency,
      } = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderAmount,
        currency,
        name: "Tree Sponsorship",
        description: "Payment for tree sponsorship",
        order_id,
        handler: async (response: any) => {
          await handlePaymentCallback(response, type);
        },
        prefill: {
          name: "Your Name",
          email: "email@example.com",
          contact: "9999999999",
        },
        theme: { color: "#0f766e" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment initiation failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (response: any, type: PaymentType) => {
    try {
      const callbackPayload: CallbackPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        type,
      };

      const { data } = await api.post<CallbackResponse>(
        "/api/payment/callback",
        callbackPayload,
      );

      if (data.success) {
        toast.success("Payment successful!");
      } else {
        toast.error("Payment verification failed!");
      }
    } catch (error: any) {
      console.error("Payment callback error:", error);
      toast.error("Payment verification failed!");
    }
  };

  return { initiatePayment, loading };
}
