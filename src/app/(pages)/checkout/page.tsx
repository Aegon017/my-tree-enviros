"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { ApplyCoupon } from "@/components/apply-coupon";
import RazorpayButton from "@/components/razorpay-button";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import ShippingAddresses from "@/components/shipping-address";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authStorage } from "@/lib/auth-storage";

interface ProductPrice {
  duration: number;
  price: string;
}

interface Product {
  id: number;
  name: string;
  price: ProductPrice[];
}

interface EcomProduct {
  id: number;
  price: number;
  name?: string;
}

interface CartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  product_id: number;
  quantity: number;
  duration?: number;
  coupon_code: string | null;
  ecom_product?: EcomProduct;
  product?: Product;
}

interface CartResponse {
  status: boolean;
  message: string;
  data: CartItem[];
}

interface UserData {
  email: string;
  mobile: string;
  name: string;
}

interface PaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

const calculateItemPrice = (item: CartItem): number => {
  // E-commerce product
  if (item.product_type === 2 && item.ecom_product) {
    return item.ecom_product.price * item.quantity;
  }

  // Tree product
  if (item.product_type === 1 && item.product?.price?.length) {
    const priceInfo = item.duration
      ? item.product.price.find((p) => p.duration === item.duration)
      : item.product.price[0];

    return priceInfo ? parseFloat(priceInfo.price) * item.quantity : 0;
  }

  return 0;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fetch cart data
  const {
    data: cartData,
    error,
    isLoading,
    isValidating,
  } = useSWR<CartResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart`,
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        console.error("Failed to fetch cart:", err);
      },
    },
  );

  // Fetch user data
  const { data: userData } = useSWR<UserData>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const cartItems = useMemo(
    () => (cartData?.status ? cartData.data : []),
    [cartData],
  );

  const { baseTotal, hasTreeProducts, hasEcomProducts } = useMemo(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + calculateItemPrice(item),
      0,
    );
    const hasTree = cartItems.some((item) => item.product_type === 1);
    const hasEcom = cartItems.some((item) => item.product_type === 2);
    return {
      baseTotal: total,
      hasTreeProducts: hasTree,
      hasEcomProducts: hasEcom,
    };
  }, [cartItems]);

  const handleAddressSelect = useCallback((addressId: number) => {
    setSelectedAddressId(addressId);
  }, []);

  const handleCouponApplied = useCallback((discount: number) => {
    setDiscountAmount(discount);
  }, []);

  const handleCouponRemoved = useCallback(() => {
    setDiscountAmount(0);
  }, []);

  const handlePaymentSuccess = useCallback(
    (response: PaymentSuccessResponse) => {
      router.push(
        `/payment/success?order_id=${response.razorpay_order_id}&transaction_id=${response.razorpay_payment_id}&amount=${response.amount}`,
      );
    },
    [router],
  );

  const handlePaymentFailure = useCallback(
    (error: unknown) => {
      const orderTotal = Math.max(0, baseTotal - discountAmount);
      let errorMessage = "Payment failed";

      if (error && typeof error === "object") {
        if ("description" in error && typeof error.description === "string") {
          errorMessage = error.description;
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      router.push(
        `/payment/failed?error=${encodeURIComponent(errorMessage)}&amount=${orderTotal}`,
      );
    },
    [router, baseTotal, discountAmount],
  );

  const orderTotal = useMemo(() => {
    return Math.max(0, baseTotal - discountAmount);
  }, [baseTotal, discountAmount]);

  const isPaymentDisabled =
    !selectedAddressId || orderTotal <= 0 || isLoading || isValidating;

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !cartData?.data) {
    return (
      <Section>
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            <h2 className="font-bold mb-2">Unable to load cart items</h2>
            <p>
              Please try again later or contact support if the problem persists.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  // Show empty cart state
  if (cartItems.length === 0) {
    return (
      <Section>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="Checkout"
        align="center"
        subtitle="Review your order, apply coupons, and complete your purchase"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Shipping Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Select your shipping address</CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingAddresses
                onSelect={handleAddressSelect}
                selectedAddressId={selectedAddressId}
              />
              {!selectedAddressId && (
                <p className="text-red-500 text-sm mt-2">
                  Please select a shipping address to proceed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Coupon and Order Summary */}
        <div className="space-y-6">
          <ApplyCoupon
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            currentTotal={baseTotal}
          />

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{baseTotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t pt-4 text-lg">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>

                <div className="pt-4">
                  <RazorpayButton
                    currency="INR"
                    type={4}
                    product_type={2}
                    shipping_address_id={selectedAddressId}
                    amount={orderTotal}
                    user={userData || null}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFailure={handlePaymentFailure}
                    disabled={isPaymentDisabled}
                  />

                  {isPaymentDisabled && (
                    <p className="text-red-500 text-sm mt-2">
                      {!selectedAddressId
                        ? "Please select a shipping address to proceed with payment."
                        : "Please ensure your cart has valid items to proceed with payment."}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
