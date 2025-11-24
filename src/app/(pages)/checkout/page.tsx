"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { ApplyCoupon } from "@/components/apply-coupon";
import RazorpayButton from "@/components/razorpay-button";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import ShippingAddresses from "@/components/shipping-address";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cartService } from "@/services/cart.services";
import { CartItem, BackendCartResponse } from "@/types/cart.types";
import { toast } from "sonner";
import { LoginDialog } from "@/components/login-dialog";

const calculateItemPrice = (item: CartItem): number => {
  return item.subtotal || (item.price * item.quantity);
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cartData, setCartData] = useState<BackendCartResponse | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
    } else {
      setIsLoginOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await cartService.index();
        if (response?.data?.cart) {
          setCartData(response.data.cart);
          setCartItems(response.data.cart.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setError(err as Error);
        toast.error("Failed to load cart details");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const { baseTotal, totalItems } = useMemo(() => {
    const total = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
    return {
      baseTotal: total,
      totalItems: cartItems.length,
    };
  }, [cartItems]);

  const handleAddressSelect = (addressId: number | null) => {
    setSelectedAddressId(addressId);
  };

  const handleCouponApplied = useCallback((discount: number) => {
    setDiscountAmount(discount);
  }, []);

  const handleCouponRemoved = useCallback(() => {
    setDiscountAmount(0);
  }, []);

  const orderTotal = useMemo(() => {
    return Math.max(0, baseTotal - discountAmount);
  }, [baseTotal, discountAmount]);

  const isPaymentDisabled = !selectedAddressId || orderTotal <= 0 || isLoading;

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

  if (isLoading && !cartData) {
    return (
      <Section className="min-h-screen pt-32">
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
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6" role="alert">
            <h2 className="font-bold mb-2">Unable to load cart items</h2>
            <p>Please try again later or contact support if the problem persists.</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="destructive">
              Retry
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  if (!cartData || cartItems.length === 0) {
    return (
      <Section className="min-h-screen pt-32">
        <div className="container mx-auto px-4 py-8 text-center">
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
      <SectionTitle title="Checkout" align="center" subtitle={`Review your order (${totalItems} item${totalItems !== 1 ? 's' : ''}), apply coupons, and complete your purchase`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Select your shipping address</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-card/50">
                    <div className="shrink-0">
                      <img src={item.image_url || item.item?.image || "/placeholder.png"} alt={item.item?.name || "Product"} className="h-20 w-20 object-cover rounded-md border" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate">{item.item?.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.item?.variant?.size && `Size: ${item.item.variant.size} `}
                        {item.item?.variant?.color && `Color: ${item.item.variant.color}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-medium">Qty: {item.quantity}</p>
                        <p className="font-bold">{item.formatted_subtotal}</p>
                      </div>
                    </div>
                  </div>
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

                <div className="flex justify-between font-bold border-t pt-4 text-xl">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>

                <div className="pt-6">
                  <RazorpayButton type={4} productType={2} shippingAddressId={selectedAddressId ?? 0} amount={orderTotal} cartType={1} label={`Pay ₹${orderTotal.toFixed(2)}`} />

                  {isPaymentDisabled && (
                    <p className="text-destructive text-sm mt-4 text-center">
                      {!selectedAddressId ? "Please select a shipping address to proceed with payment." : "Please ensure your cart has valid items to proceed with payment."}
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