"use client";

import { useState, useEffect } from "react";
import { ApplyCoupon } from "@/components/apply-coupon";
import ShippingAddresses from "@/components/shipping-address";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/app-layout";
import Section from "@/components/section";
import RazorpayButton from "@/components/razorpay-button";

export default function CheckoutPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [discountAmount, setDiscountAmount] = useState(0);
  const [baseTotal, setBaseTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart total from API on component mount
  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        // Simulating API call - replace with actual API call
        setTimeout(() => {
          setBaseTotal(10000); // Amount in paise (10000 paise = ₹100)
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch cart total:", error);
        setIsLoading(false);
      }
    };

    fetchCartTotal();
  }, []);

  const handleAddressSelect = (shipping_address_id: number | null) => {
    setSelectedAddressId(shipping_address_id);
  };

  const handleCouponApplied = (discount: number) => {
    setDiscountAmount(discount);
  };

  const handleCouponRemoved = () => {
    setDiscountAmount(0);
  };

  const handlePaymentSuccess = (response: any) => {
    console.log("Payment successful:", response);
    // Redirect to success page or show success message
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    // Show error message to user
  };

  // Calculate final total (in paise)
  const orderTotal = baseTotal - discountAmount;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Select your shipping address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShippingAddresses
                    onSelect={handleAddressSelect}
                    selectedAddressId={selectedAddressId}
                  />
                </CardContent>
              </Card>
            </div>

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
                      <span>₹{(baseTotal / 100).toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{(discountAmount / 100).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-medium border-t pt-4">
                      <span>Total</span>
                      <span>₹{(orderTotal / 100).toFixed(2)}</span>
                    </div>

                    <div className="pt-4">
                      <RazorpayButton
                        currency="INR"
                        type={4}
                        product_type={2}
                        shipping_address_id={selectedAddressId}
                        amount={orderTotal}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentFailure={handlePaymentFailure}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>
    </AppLayout>
  );
}
