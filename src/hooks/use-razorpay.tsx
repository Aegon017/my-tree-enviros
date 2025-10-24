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
  data: {
    razorpay_order_id: string;
    amount: number;
    currency: string;
  };
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

      // Create order from cart
      const orderRes = await api.post("/orders", {
        shipping_address_id: shippingAddressId || null,
      });
      const orderId = orderRes.data?.data?.order?.id;

      if (!orderId) {
        throw new Error("Failed to create order");
      }

      // Initiate Razorpay payment for the order
      const initRes = await api.post(`/orders/${orderId}/payment/initiate`, {
        payment_method: "razorpay",
      });
      const initData = initRes.data?.data;

      if (!initData?.amount || !initData?.razorpay_order_id) {
        throw new Error("Invalid response from server");
      }

      const {
        razorpay_order_id: order_id,
        amount: orderAmount,
        currency,
      } = initData;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderAmount,
        currency,
        name: "Tree Sponsorship",
        description: "Payment for tree sponsorship",
        order_id,
        handler: async (response: any) => {
          await handlePaymentCallback(orderId, response);
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

  const handlePaymentCallback = async (
    orderId: number | string,
    response: any,
  ) => {
    try {
      const callbackPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };

      const { data } = await api.post(
        `/orders/${orderId}/payment/verify`,
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
