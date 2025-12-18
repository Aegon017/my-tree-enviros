"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkoutService } from "@/modules/checkout/services/checkout.service";
import { CheckoutPreparePayload } from "@/types/checkout";

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkout = async (payload: CheckoutPreparePayload) => {
    setLoading(true);
    try {
      const res = await checkoutService.prepare(payload);
      const responseData = (res as any).data || res;

      if (!responseData?.order) throw new Error("Failed to prepare checkout");
      const { order, payment } = responseData;

      if (payment.gateway === "razorpay") {
        const { loadRazorpay } = await import("@/lib/razorpay");
        await loadRazorpay();

        const options = {
          key: payment.key,
          amount: payment.amount,
          currency: payment.currency,
          name: process.env.NEXT_PUBLIC_APP_NAME ?? "My Tree Enviros",
          description: `Order #${order.reference_number}`,
          order_id: payment.order_id,
          handler: async function (response: any) {
            try {
              await checkoutService.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_reference: order.reference_number,
              });
              toast.success("Payment successful");
              router.push(`/payment/success?order_id=${order.id}`);
            } catch (e: any) {
              console.error(e);
              toast.error("Payment verification failed");
              router.push("/payment/failure?reason=verification_failed");
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          theme: {
            color: "#0f766e",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          console.error(response.error);
          toast.error("Payment failed");
          router.push("/payment/failure?reason=payment_failed");
        });
        rzp1.open();
      } else if (payment.gateway === "phonepe") {
        try {
          const { loadPhonePeScript } = await import("@/lib/phonepe");
          const isProd = payment.env === "PROD";
          await loadPhonePeScript(isProd);

          if (window.PhonePeCheckout) {
            await window.PhonePeCheckout.transact({
              tokenUrl: payment.url!,
              callback: () => {},
            });
          } else {
            window.location.href = payment.url!;
          }
        } catch (err) {
          console.error(err);
          window.location.href = payment.url!;
        }
      } else {
        throw new Error("Unsupported payment gateway");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.response?.data?.message || e?.message || "Checkout failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading };
}
