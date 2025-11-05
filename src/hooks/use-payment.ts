
"use client";

import { useState } from "react";
import { createOrder, paymentCallback } from "@/services/payment.service";
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
      const orderData = await createOrder(payload);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Ecommerce",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            await paymentCallback({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: payload.type,
            });
            router.push("/payment/success");
          } catch (error) {
            router.push("/payment/failure");
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          contact: orderData.customer_phone,
        },
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
