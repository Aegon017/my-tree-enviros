"use client";

import { useState } from "react";
import { orderService } from "@/services/order.services";
import { paymentService } from "@/services/payment.services";
import { useRouter } from "next/navigation";

declare const Razorpay: any;

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function initiatePayment(payload: {
    currency: string;
    type: "1" | "2" | "3";
    product_type: "1" | "2";
    cart_type: "1" | "2";
  }) {
    setLoading(true);
    try {
      // Create order (legacy behavior: create an order record first)
      const created = await orderService.createOrder({} as any);
      const orderId = created?.data?.order?.id;
      if (!orderId) throw new Error("Failed to create order");

      // Initiate payment for the created order
      const initRes = await paymentService.initiatePayment(orderId);
      const initData = (initRes as any)?.data;
      if (!initData) throw new Error("Failed to initiate payment");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: initData.amount,
        currency: initData.currency,
        name: "My Tree Enviros",
        order_id: initData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            await paymentService.verifyPayment(orderId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push("/payment/success");
          } catch (error) {
            router.push("/payment/failure");
          }
        },
        prefill: {},
        theme: { color: "#3399cc" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      router.push("/payment/failure");
    } finally {
      setLoading(false);
    }
  }

  return {
    initiatePayment,
    loading,
  };
}
