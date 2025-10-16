"use client";

export async function createOrder(payload: {
  currency: string;
  type: "1" | "2" | "3";
  product_type: "1" | "2";
  cart_type: "1" | "2";
  shipping_address_id?: number;
}) {
  const res = await fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function paymentCallback(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type: "1" | "2" | "3" | "4";
}) {
  const res = await fetch("/payment/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Payment verification failed");
  return res.json();
}
