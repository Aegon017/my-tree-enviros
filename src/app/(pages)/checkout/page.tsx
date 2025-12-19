"use client";

import { Suspense } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import ShippingAddresses from "@/components/shipping-address";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";
import { ApplyCoupon } from "@/components/apply-coupon";
import api from "@/services/http-client";
import { useCheckout } from "@/modules/checkout/hooks/use-checkout";
import { checkoutService } from "@/modules/checkout/services/checkout.service";
import { CheckoutSummary, CheckoutItem } from "@/types/checkout";
import { PaymentGateway } from "@/types/payment-gateway";

function CheckoutItemCard({ item }: { item: CheckoutItem }) {
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
            {item.type === "campaign" && (
              <p className="text-sm text-muted-foreground mt-1">
                Campaign Donation
              </p>
            )}
            {(item.type === "sponsor" || item.type === "adopt") && (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.duration} {item.duration_unit}
                </p>
                {item.dedication && (
                  <div className="text-sm mt-2 space-y-1">
                    {item.dedication.name && (
                      <p>
                        <b>Name:</b> {item.dedication.name}
                      </p>
                    )}
                    {item.dedication.occasion && (
                      <p>
                        <b>Occasion:</b> {item.dedication.occasion}
                      </p>
                    )}
                    {item.dedication.message && (
                      <p>
                        <b>Message:</b> {item.dedication.message}
                      </p>
                    )}
                  </div>
                )}
                {item.initiative_site_label && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <b>Site:</b> {item.initiative_site_label}
                  </p>
                )}
              </>
            )}
            <div className="flex justify-between mt-2">
              <p className="text-sm font-medium">Qty: {item.quantity}</p>
              <p className="font-bold">
                ₹{Number(item.total_amount).toFixed(2)}
              </p>
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
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [dedication, setDedication] = useState<{
    name: string;
    occasion: string;
    message: string;
  } | null>(null);

  const allowCoupons = useMemo(
    () => summary?.items.some((i) => i.type !== "campaign"),
    [summary],
  );

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

    // Parse dedication from URL params
    const dedicationName = searchParams.get("dedication_name");
    const dedicationOccasion = searchParams.get("dedication_occasion");
    const dedicationMessage = searchParams.get("dedication_message");

    if (dedicationName || dedicationOccasion || dedicationMessage) {
      setDedication({
        name: dedicationName || "",
        occasion: dedicationOccasion || "",
        message: dedicationMessage || "",
      });
    }

    fetchSummary(couponCode ?? undefined);
  }, [fetchSummary, couponCode, user, searchParams]);

  const handleCouponApplied = useCallback(
    (discount: number, couponId: number, code: string) => {
      setCouponCode(code);
      fetchSummary(code);
    },
    [fetchSummary],
  );

  const handleCouponRemoved = useCallback(() => {
    setCouponCode(null);
    fetchSummary();
  }, [fetchSummary]);

  const fetchGateways = useCallback(async () => {
    try {
      const res = await checkoutService.getPaymentGateways();
      const list = res.data ?? [];
      setGateways(list);
      if (list.length > 0 && !paymentMethod) {
        setPaymentMethod(list[0].slug);
      }
    } catch (error) {
      console.error("Failed to fetch payment gateways", error);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const [paymentMethod, setPaymentMethod] = useState<string>("");

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
        campaign_id: item.campaign_id,
        initiative_site_id: item.initiative_site_id,
        dedication: dedication || item.dedication,
      })),
      coupon_code: couponCode,
      shipping_address_id: selectedAddress,
      payment_method: paymentMethod,
    };
  }, [summary, couponCode, selectedAddress, dedication, paymentMethod]);

  const handlePayment = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    const hasProducts = summary?.items.some(
      (i: CheckoutItem) => i.type === "product",
    );
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
    [summary],
  );

  const isPayDisabled =
    loading ||
    !summary ||
    summary.items.length === 0 ||
    processing ||
    (hasProducts && !selectedAddress);

  if (!user) {
    return (
      <Section>
        <SectionTitle title="Checkout" />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Please log in to continue with checkout.
            </p>
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
            <Button className="mt-4" onClick={() => router.push("/store")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title={`Review your order (${summary.items.length} items)`}
      />
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

          {dedication && (
            <Card>
              <CardHeader>
                <CardTitle>Dedication Details</CardTitle>
                <CardDescription>
                  Edit your dedication information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dedication-name">Name</Label>
                  <Input
                    id="dedication-name"
                    value={dedication.name}
                    onChange={(e) =>
                      setDedication({ ...dedication, name: e.target.value })
                    }
                    placeholder="Name on certificate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dedication-occasion">Occasion</Label>
                  <Input
                    id="dedication-occasion"
                    value={dedication.occasion}
                    onChange={(e) =>
                      setDedication({ ...dedication, occasion: e.target.value })
                    }
                    placeholder="Birthday, Anniversary, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dedication-message">Special Message</Label>
                  <Textarea
                    id="dedication-message"
                    value={dedication.message}
                    onChange={(e) =>
                      setDedication({ ...dedication, message: e.target.value })
                    }
                    placeholder="A message for the certificate"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {allowCoupons && (
            <ApplyCoupon
              currentTotal={summary.subtotal}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />
          )}
        </div>

        <div className="space-y-6 sticky top-16 self-start">
          <Card>
            <CardHeader>
              <CardTitle>Payment Mode</CardTitle>
              <CardDescription>Select how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                {gateways.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Loading payment methods...
                  </p>
                ) : (
                  gateways.map((gateway) => (
                    <Label
                      key={gateway.id}
                      htmlFor={`pm_${gateway.slug}`}
                      className={`flex items-center justify-between border p-4 rounded-md cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground ${paymentMethod === gateway.slug
                        ? "border-primary bg-accent/50 shadow-sm"
                        : "border-muted"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={gateway.slug}
                          id={`pm_${gateway.slug}`}
                        />
                        <span className="font-medium">{gateway.name}</span>
                      </div>
                      {gateway.image && (
                        <div className="h-6 w-auto max-w-[80px]">
                          <img
                            src={gateway.image}
                            alt={gateway.name}
                            className="h-full w-auto object-contain"
                          />
                        </div>
                      )}
                    </Label>
                  ))
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₹{summary.subtotal.toFixed(2)}
                </span>
              </div>

              {summary.charges.map((charge: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{charge.label}</span>
                  <span className="font-medium">
                    ₹{Number(charge.amount).toFixed(2)}
                  </span>
                </div>
              ))}

              {summary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -₹{summary.discount.toFixed(2)}
                  </span>
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
                {processing
                  ? "Processing..."
                  : `Pay ₹${summary.grand_total.toFixed(2)}`}
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
    <Suspense
      fallback={
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
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
