"use client";

import api from "@/services/http-client";

export interface RazorpayOrderResponse {
  success: boolean;
  message: string;
  data: {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key: string;
  };
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    order_id: number;
    payment_status: string;
    transaction_id: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data: {
    order_id: number;
    payment_status: string;
    order_status: string;
    transaction_id?: string;
    amount: number;
  };
}


export const paymentService = {

  initiatePayment: async (orderId: number): Promise<RazorpayOrderResponse> => {
    const response = await api.post<RazorpayOrderResponse>(
      `/orders/${orderId}/payment/initiate`,
      { payment_method: "razorpay" },
    );
    return response.data;
  },


  verifyPayment: async (
    orderId: number,
    payload: PaymentVerificationPayload,
  ): Promise<PaymentVerificationResponse> => {
    const response = await api.post<PaymentVerificationResponse>(
      `/orders/${orderId}/payment/verify`,
      payload,
    );
    return response.data;
  },


  getPaymentStatus: async (orderId: number): Promise<PaymentStatusResponse> => {
    const response = await api.get<PaymentStatusResponse>(
      `/orders/${orderId}/payment/status`,
    );
    return response.data;
  },


  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }


      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },


  openRazorpayCheckout: async (
    options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description?: string;
      image?: string;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: {
        color?: string;
      };
    },
    onSuccess: (response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => void,
    onFailure: (error: any) => void,
  ): Promise<void> => {
    const isLoaded = await paymentService.loadRazorpayScript();

    if (!isLoaded) {
      throw new Error("Failed to load Razorpay SDK");
    }

    const razorpayOptions = {
      ...options,
      handler: onSuccess,
      modal: {
        ondismiss: () => {
          onFailure(new Error("Payment cancelled by user"));
        },
      },
    };

    try {
      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.on("payment.failed", (response: any) => {
        onFailure(response.error);
      });
      razorpay.open();
    } catch (error) {
      onFailure(error);
    }
  },


  formatAmount: (amount: number, currency = "INR"): string => {
    const value = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  },


  rupeesToPaise: (rupees: number): number => {
    return Math.round(rupees * 100);
  },


  paiseToRupees: (paise: number): number => {
    return paise / 100;
  },


  getPaymentStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      processing: "blue",
      completed: "green",
      failed: "red",
      refunded: "gray",
    };

    return colorMap[status.toLowerCase()] || "gray";
  },


  getPaymentStatusText: (status: string): string => {
    const textMap: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded",
    };

    return textMap[status.toLowerCase()] || status;
  },


  isPaymentSuccessful: (status: string): boolean => {
    return status.toLowerCase() === "completed";
  },


  isPaymentPending: (status: string): boolean => {
    return ["pending", "processing"].includes(status.toLowerCase());
  },


  isPaymentFailed: (status: string): boolean => {
    return status.toLowerCase() === "failed";
  },
};


export async function createOrder(payload: {
  currency: string;
  type: "1" | "2" | "3";
  product_type: "1" | "2";
  cart_type: "1" | "2";
  shipping_address_id?: number;
}) {


  console.warn(
    "createOrder is deprecated. Use orderService.createOrder instead.",
  );
  const response = await api.post("/orders", payload);
  return response.data;
}

export async function paymentCallback(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type: "1" | "2" | "3" | "4";
}) {

  console.warn(
    "paymentCallback is deprecated. Use paymentService.verifyPayment instead.",
  );


  return payload;
}
