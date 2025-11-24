"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, ShoppingBag } from "lucide-react";
import { ApplyCoupon } from "@/components/apply-coupon";
import RazorpayButton from "@/components/razorpay-button";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import ShippingAddresses from "@/components/shipping-address";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { LoginDialog } from "@/components/login-dialog";
import { CartItem } from "@/domain/cart/cart-item";

function CheckoutItemCard({ item }: { item: CartItem }) {
  const isProduct = item.type === "product";
  const displayName = isProduct ? item.name : item.tree?.name ?? "Tree";
  const imageUrl = item.image_url ?? "/placeholder-image.jpg";

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0">
            <Image src={imageUrl} alt={displayName} fill className="object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base truncate">{displayName}</h4>

            {isProduct && item.variant && (
              <p className="text-sm text-muted-foreground mt-1">
                {[item.variant.color, item.variant.size, item.variant.planter]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}

            {!isProduct && (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.duration} {item.duration_unit ?? item.plan?.duration_unit ?? "year"}
                </p>
                {item.dedication && (
                  <div className="text-sm mt-2 space-y-1">
                    {item.dedication.name && <p><span className="font-medium">Name:</span> {item.dedication.name}</p>}
                    {item.dedication.occasion && <p><span className="font-medium">Occasion:</span> {item.dedication.occasion}</p>}
                    {item.dedication.message && <p><span className="font-medium">Message:</span> {item.dedication.message}</p>}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-medium">Qty: {item.quantity}</p>
              <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, loading } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponId, setCouponId] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
    } else {
      setIsLoginOpen(false);
    }
  }, [isAuthenticated]);

  const hasProductItems = useMemo(() => {
    return items.some((item) => item.type === "product");
  }, [items]);

  const { baseTotal, totalItems } = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      baseTotal: total,
      totalItems: items.length,
    };
  }, [items]);

  const handleAddressSelect = (addressId: number | null) => {
    setSelectedAddressId(addressId);
  };

  const handleCouponApplied = useCallback((discount: number, id: number) => {
    setDiscountAmount(discount);
    setCouponId(id);
  }, []);

  const handleCouponRemoved = useCallback(() => {
    setDiscountAmount(0);
    setCouponId(null);
  }, []);

  const orderTotal = useMemo(() => {
    return Math.max(0, baseTotal - discountAmount);
  }, [baseTotal, discountAmount]);

  const taxCalculations = useMemo(() => {
    const subtotalAfterDiscount = orderTotal;
    const gstRate = 0.18;
    const gstAmount = subtotalAfterDiscount * gstRate;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const totalWithTax = subtotalAfterDiscount + gstAmount;

    return {
      gst: gstAmount,
      cgst: cgstAmount,
      sgst: sgstAmount,
      total: totalWithTax,
    };
  }, [orderTotal]);

  const isPaymentDisabled = (hasProductItems && !selectedAddressId) || orderTotal <= 0 || loading;

  const productType = useMemo(() => {
    const hasProducts = items.some((item) => item.type === "product");
    const hasTrees = items.some((item) => item.type === "sponsor" || item.type === "adopt");
    if (hasProducts && hasTrees) return 2;
    if (hasProducts) return 2;
    return 1;
  }, [items]);

  if (!isAuthenticated) {
    return (
      <Section className="min-h-screen pt-32">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please login to view your cart and proceed to checkout.
          </p>
          <Button onClick={() => setIsLoginOpen(true)}>Login</Button>
          <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onSuccess={() => { setIsLoginOpen(false); }} />
        </div>
      </Section>
    );
  }

  if (loading) {
    return (
      <Section className="min-h-screen pt-32">
        <div className="container mx-auto px-4 py-8">
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
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section className="min-h-screen pt-32">
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button onClick={() => router.push("/store")} size="lg">
            Continue Shopping
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen pt-32">
      <SectionTitle
        title="Checkout"
        align="center"
        subtitle={`Review your order (${totalItems} item${totalItems !== 1 ? 's' : ''}), apply coupons, and complete your purchase`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          {hasProductItems && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Select your shipping address for product delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <ShippingAddresses onSelect={handleAddressSelect} selectedAddressId={selectedAddressId} />
                {!selectedAddressId && (
                  <p className="text-destructive text-sm mt-4 text-center font-medium">
                    Please select a shipping address to proceed.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <CheckoutItemCard key={item.id ?? item.clientId} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ApplyCoupon onCouponApplied={handleCouponApplied} onCouponRemoved={handleCouponRemoved} currentTotal={baseTotal} />

          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{baseTotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>GST (18%)</span>
                  <span>₹{taxCalculations.gst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground text-sm pl-4">
                  <span>CGST (9%)</span>
                  <span>₹{taxCalculations.cgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground text-sm pl-4">
                  <span>SGST (9%)</span>
                  <span>₹{taxCalculations.sgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold border-t pt-4 text-xl">
                  <span>Total</span>
                  <span>₹{taxCalculations.total.toFixed(2)}</span>
                </div>

                <div className="pt-6">
                  <RazorpayButton
                    type={4}
                    productType={productType}
                    shippingAddressId={selectedAddressId}
                    amount={taxCalculations.total}
                    cartType={1}
                    label={`Pay ₹${taxCalculations.total.toFixed(2)}`}
                    coupon_id={couponId ?? undefined}
                  />

                  {isPaymentDisabled && (
                    <p className="text-destructive text-sm mt-4 text-center">
                      {hasProductItems && !selectedAddressId
                        ? "Please select a shipping address to proceed with payment."
                        : "Please ensure your cart has valid items to proceed with payment."}
                    </p>
                  )}
                </div>

                <div className="text-xs text-center text-muted-foreground mt-4">
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}