declare global {
  interface Window {
    Razorpay: any;
    PhonePeCheckout: {
      transact: (obj: {
        tokenUrl: string;
        callback?: (response: any) => void;
        type?: string;
      }) => Promise<void>;
    };
  }
}
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const existing = document.querySelector("#razorpay-script");
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
