"use client";

import api from "@/lib/axios";

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

/**
 * Payment Service for managing payment operations
 * All endpoints require authentication
 */
export const paymentService = {
  /**
   * Initiate Razorpay payment for an order
   * @param orderId - Order ID
   */
  initiatePayment: async (orderId: number): Promise<RazorpayOrderResponse> => {
    const response = await api.post<RazorpayOrderResponse>(
      `/orders/${orderId}/payment/initiate`,
      { payment_method: "razorpay" },
    );
    return response.data;
  },

  /**
   * Verify Razorpay payment after successful payment
   * @param orderId - Order ID
   * @param payload - Payment verification data from Razorpay
   */
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

  /**
   * Get payment status for an order
   * @param orderId - Order ID
   */
  getPaymentStatus: async (orderId: number): Promise<PaymentStatusResponse> => {
    const response = await api.get<PaymentStatusResponse>(
      `/orders/${orderId}/payment/status`,
    );
    return response.data;
  },

  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      // Check if script already loaded
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

  /**
   * Open Razorpay checkout
   * @param options - Razorpay options
   * @param onSuccess - Success callback
   * @param onFailure - Failure callback
   */
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

  /**
   * Format amount for display
   * @param amount - Amount in smallest currency unit (paise)
   * @param currency - Currency code
   */
  formatAmount: (amount: number, currency = "INR"): string => {
    const value = amount / 100; // Convert paise to rupees
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  },

  /**
   * Convert rupees to paise
   * @param rupees - Amount in rupees
   */
  rupeesToPaise: (rupees: number): number => {
    return Math.round(rupees * 100);
  },

  /**
   * Convert paise to rupees
   * @param paise - Amount in paise
   */
  paiseToRupees: (paise: number): number => {
    return paise / 100;
  },

  /**
   * Get payment status color for UI
   * @param status - Payment status
   */
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

  /**
   * Get payment status text
   * @param status - Payment status
   */
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

  /**
   * Check if payment is successful
   * @param status - Payment status
   */
  isPaymentSuccessful: (status: string): boolean => {
    return status.toLowerCase() === "completed";
  },

  /**
   * Check if payment is pending
   * @param status - Payment status
   */
  isPaymentPending: (status: string): boolean => {
    return ["pending", "processing"].includes(status.toLowerCase());
  },

  /**
   * Check if payment failed
   * @param status - Payment status
   */
  isPaymentFailed: (status: string): boolean => {
    return status.toLowerCase() === "failed";
  },
};

// Legacy function exports for backward compatibility
export async function createOrder(payload: {
  currency: string;
  type: "1" | "2" | "3";
  product_type: "1" | "2";
  cart_type: "1" | "2";
  shipping_address_id?: number;
}) {
  // This should now use orderService.createOrder instead
  // Keeping for backward compatibility
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
  // This should now use paymentService.verifyPayment instead
  console.warn(
    "paymentCallback is deprecated. Use paymentService.verifyPayment instead.",
  );
  // Extract order ID from razorpay_order_id or use a different method
  // For now, just return the payload
  return payload;
}
