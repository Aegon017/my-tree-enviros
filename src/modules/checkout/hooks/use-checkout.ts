"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkoutService } from "@/modules/checkout/services/checkout.service";
import { paymentService } from "@/modules/payments/services/payments.service";
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
                await paymentService.loadRazorpayScript();
                await paymentService.openRazorpayCheckout(
                    {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                        amount: payment.amount,
                        currency: payment.currency,
                        order_id: payment.order_id,
                        name: process.env.NEXT_PUBLIC_APP_NAME ?? "My Tree Enviros",
                        description: `Order #${order.reference_number}`,
                        prefill: {
                            name: "",
                            email: "",
                            contact: '',
                        },
                        theme: { color: "#0f766e" },
                    },
                    async (response: any) => {
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
                    (error: any) => {
                        console.error(error);
                        toast.error("Payment failed");
                        router.push("/payment/failure?reason=payment_failed");
                    }
                );
            } else {
                throw new Error("Unsupported payment gateway");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || e?.message || "Checkout failed");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { checkout, loading };
}