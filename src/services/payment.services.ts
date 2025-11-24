"use client";

import api from "@/services/http-client";
import { ApiResponse } from "@/services/http-client";
import { Order } from "./order.services";

export interface RazorpayOrderResponse {
  razorpay_order_id?: string;
  amount: number;
  amount_rupees: number;
  currency: string;
  key?: string;
  order_number: string;
  is_free?: boolean;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse
  extends ApiResponse<{
    order: Order;
    payment_id: string;
  }> {}

export interface PaymentStatusResponse
  extends ApiResponse<{
    order_id: number;
    order_number: string;
    order_status: string;
    order_status_label: string;
    payment: {
      id: number;
      amount: number;
      payment_method: string;
      transaction_id: string;
      status: string;
      paid_at: string;
    } | null;
  }> {}

export const paymentService = {
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  initiatePayment: async (orderId: number) => {
    const response = await api.post<RazorpayOrderResponse>(
      `/orders/${orderId}/payment/initiate`,
      {
        payment_method: "razorpay",
      },
    );
    return response as ApiResponse<RazorpayOrderResponse>;
  },

  verifyPayment: async (
    orderId: number,
    paymentData: PaymentVerificationPayload,
  ) => {
    const response = await api.post<PaymentVerificationResponse["data"]>(
      `/orders/${orderId}/payment/verify`,
      paymentData,
    );
    return response as PaymentVerificationResponse;
  },

  getPaymentStatus: async (orderId: number) => {
    const response = await api.get<PaymentStatusResponse["data"]>(
      `/orders/${orderId}/payment/status`,
    );
    return response as PaymentStatusResponse;
  },

  paiseToRupees: (paise: number): number => {
    return paise / 100;
  },

  openRazorpayCheckout: async (
    options: any,
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void,
  ) => {
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      console.error("Razorpay SDK not loaded");
      onFailure({ message: "Razorpay SDK not loaded" });
      return;
    }

    const rzp = new Razorpay({
      ...options,
      handler: onSuccess,
    });

    rzp.on("payment.failed", onFailure);
    rzp.open();
  },
};
