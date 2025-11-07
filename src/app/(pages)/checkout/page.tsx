"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { cartService, type CartItem, type CartResponse } from "@/services/cart.service";

const calculateItemPrice = ( item: CartItem ): number => {
  return item.subtotal;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [ selectedAddressId, setSelectedAddressId ] = useState<number | null>(
    null,
  );
  const [ discountAmount, setDiscountAmount ] = useState( 0 );
  const [ cartData, setCartData ] = useState<CartResponse['data']['cart'] | null>( null );
  const [ cartItems, setCartItems ] = useState<CartItem[]>( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ error, setError ] = useState<Error | null>( null );

  useEffect( () => {
    const fetchCart = async () => {
      if ( !isAuthenticated ) {
        router.push( "/sign-in" );
        return;
      }

      setIsLoading( true );
      setError( null );

      try {
        const response = await cartService.getCart();
        if ( response.success && response.data.cart ) {
          setCartData( response.data.cart );
          setCartItems( response.data.cart.items || [] );
        }
      } catch ( err ) {
        console.error( "Failed to fetch cart:", err );
        setError( err as Error );
      } finally {
        setIsLoading( false );
      }

    };

    fetchCart();
  }, [ isAuthenticated, router ] );

  const { baseTotal, totalItems } = useMemo( () => {
    const total = cartItems.reduce(
      ( sum, item ) => sum + calculateItemPrice( item ),
      0,
    );
    return {
      baseTotal: total,
      totalItems: cartData?.total_items || 0,
    };
  }, [ cartItems, cartData ] );

  const handleAddressSelect = ( addressId: number | null ) => {
    setSelectedAddressId( addressId );
  };

  const handleCouponApplied = useCallback( ( discount: number ) => {
    setDiscountAmount( discount );
  }, [] );

  const handleCouponRemoved = useCallback( () => {
    setDiscountAmount( 0 );
  }, [] );

  const orderTotal = useMemo( () => {
    return Math.max( 0, baseTotal - discountAmount );
  }, [ baseTotal, discountAmount ] );

  const isPaymentDisabled = !selectedAddressId || orderTotal <= 0 || isLoading;

  if ( isLoading ) {
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

  if ( error ) {
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
              onClick={ () => window.location.reload() }
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  if ( !cartData || cartItems.length === 0 ) {
    return (
      <Section>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button
            onClick={ () => router.push( "/store" ) }
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
        subtitle={`Review your order (${totalItems} item${totalItems !== 1 ? 's' : ''}), apply coupons, and complete your purchase`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Select your shipping address</CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingAddresses
                onSelect={ handleAddressSelect }
                selectedAddressId={ selectedAddressId }
              />
              { !selectedAddressId && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  Please select a shipping address to proceed.
                </p>
              ) }
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
                  <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="shrink-0">
                      <img
                        src={item.item.image || item.item.product.thumbnail_url}
                        alt={item.item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.item.name}</h4>
                      <p className="text-xs text-gray-500">SKU: {item.item.sku}</p>
                      {item.options?.variant && (
                        <p className="text-xs text-gray-500">
                          {item.options.variant.size && `Size: ${item.options.variant.size} `}
                          {item.options.variant.color && `Color: ${item.options.variant.color}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.formatted_subtotal}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ApplyCoupon
            onCouponApplied={ handleCouponApplied }
            onCouponRemoved={ handleCouponRemoved }
            currentTotal={ baseTotal }
          />

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{ baseTotal.toFixed( 2 ) }</span>
                </div>

                { discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{ discountAmount.toFixed( 2 ) }</span>
                  </div>
                ) }

                <div className="flex justify-between font-bold border-t pt-4 text-lg">
                  <span>Total</span>
                  <span>₹{ orderTotal.toFixed( 2 ) }</span>
                </div>

                <div className="pt-4">
                  <RazorpayButton
                    type={ 4 }
                    productType={ 2 }
                    shippingAddressId={ selectedAddressId ?? 0 }
                    amount={ orderTotal }
                    cartType={ 1 }
                    label="Pay Now"
                  />

                  { isPaymentDisabled && (
                    <p className="text-red-500 text-sm mt-4 text-center">
                      { !selectedAddressId
                        ? "Please select a shipping address to proceed with payment."
                        : "Please ensure your cart has valid items to proceed with payment." }
                    </p>
                  ) }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}