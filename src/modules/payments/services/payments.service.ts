import api from "@/services/http-client";

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

  async verifyPayment(paymentData: any) {
    return await api.post<any>("/checkout/verify", paymentData);
  },
};
