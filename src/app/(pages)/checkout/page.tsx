"use client";

import { Suspense } from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import ShippingAddresses from "@/components/shipping-address";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";
import { ApplyCoupon } from "@/components/apply-coupon";
import api from "@/services/http-client";
import { useCheckout } from "@/modules/checkout/hooks/use-checkout";
import { CheckoutSummary, CheckoutItem } from "@/types/checkout";

function CheckoutItemCard({ item }: { item: CheckoutItem }) {
  const isProduct = item.type === "product";
  const name = item.name;
  const img = item.image_url ?? "/placeholder-image.jpg";

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0">
            <Image src={img} alt={name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base truncate">{name}</h4>
            {!isProduct && (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.duration} {item.duration_unit}
                </p>
                {item.dedication && (
                  <div className="text-sm mt-2 space-y-1">
                    {item.dedication.name && <p><b>Name:</b> {item.dedication.name}</p>}
                    {item.dedication.occasion && <p><b>Occasion:</b> {item.dedication.occasion}</p>}
                    {item.dedication.message && <p><b>Message:</b> {item.dedication.message}</p>}
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between mt-2">
              <p className="text-sm font-medium">Qty: {item.quantity}</p>
              <p className="font-bold">₹{Number(item.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { checkout } = useCheckout();

  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchSummary = useCallback(async (code?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      if (code) {
        params.set("coupon_code", code);
      } else {
        params.delete("coupon_code");
      }

      const res = await api.get<any>(`/checkout?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch checkout summary", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setShowLoginDialog(true);
      setLoading(false);
      return;
    }
    fetchSummary(couponCode ?? undefined);
  }, [fetchSummary, couponCode, user]);

  const handleCouponApplied = useCallback((discount: number, couponId: number, code: string) => {
    setCouponCode(code);
    fetchSummary(code);
  }, [fetchSummary]);

  const handleCouponRemoved = useCallback(() => {
    setCouponCode(null);
    fetchSummary();
  }, [fetchSummary]);

  const buildPayload = useCallback((): any => {
    if (!summary) return null;

    return {
      items: summary.items.map((item: CheckoutItem) => ({
        type: item.type,
        quantity: item.quantity,
        amount: item.amount,
        product_variant_id: item.product_variant_id,
        plan_price_id: item.plan_price_id,
        plan_id: item.plan_id,
        tree_id: item.tree_id,
        dedication: item.dedication,
      })),
      coupon_code: couponCode,
      shipping_address_id: selectedAddress,
    };
  }, [summary, couponCode, selectedAddress]);

  const handlePayment = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    const hasProducts = summary?.items.some((i: CheckoutItem) => i.type === "product");
    if (hasProducts && !selectedAddress) {
      alert("Please select a shipping address for product items.");
      return;
    }

    setProcessing(true);
    try {
      await checkout(payload);
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setProcessing(false);
    }
  };

  const hasProducts = useMemo(
    () => summary?.items.some((i: CheckoutItem) => i.type === "product"),
    [summary]
  );

  const isPayDisabled = loading || !summary || summary.items.length === 0 || processing || (hasProducts && !selectedAddress);

  if (!user) {
    return (
      <Section>
        <SectionTitle title="Checkout" />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to continue with checkout.</p>
          </CardContent>
        </Card>
      </Section>
    );
  }

  if (loading) {
    return (
      <Section>
        <SectionTitle title="Checkout" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Section>
    );
  }

  if (!summary || summary.items.length === 0) {
    return (
      <Section>
        <SectionTitle title="Checkout" />
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button className="mt-4" onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle title={`Review your order (${summary.items.length} items)`} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {hasProducts && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Select your shipping address</CardDescription>
              </CardHeader>
              <CardContent>
                <ShippingAddresses
                  selectedAddressId={selectedAddress}
                  onSelect={setSelectedAddress}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.items.map((item: CheckoutItem, idx: number) => (
                <CheckoutItemCard key={idx} item={item} />
              ))}
            </CardContent>
          </Card>

          <ApplyCoupon
            currentTotal={summary.subtotal}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
          />
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
              </div>

              {summary.charges.map((charge: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{charge.label}</span>
                  <span className="font-medium">₹{Number(charge.amount).toFixed(2)}</span>
                </div>
              ))}

              {summary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{summary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{summary.grand_total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handlePayment}
                disabled={isPayDisabled}
              >
                {processing ? "Processing..." : `Pay ₹${summary.grand_total.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <Section>
        <SectionTitle title="Checkout" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Section>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
