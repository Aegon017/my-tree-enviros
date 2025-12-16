import api from "@/services/http-client";
import { CheckoutPreparePayload, CheckoutPrepareResponse } from "@/types/checkout";

export interface CheckoutVerifyPayload {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    order_reference?: string;
    code?: string;
    merchantId?: string;
    providerReferenceId?: string;
    checksum?: string;
    transaction_id?: string;
}

export interface CheckoutVerifyResponse {
    success: boolean;
    order_id: number;
    reference_number: string;
}

export const checkoutService = {
    async prepare(payload: CheckoutPreparePayload) {
        return await api.post<CheckoutPrepareResponse>(
            "/checkout/prepare",
            payload,
        );
    },

    async verify(payload: CheckoutVerifyPayload) {
        return await api.post<CheckoutVerifyResponse>(
            "/checkout/verify",
            payload,
        );
    },
};
