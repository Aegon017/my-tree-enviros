"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useState } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { ApplyCoupon } from "@/components/apply-coupon";
import RazorpayButton from "@/components/razorpay-button";
import Section from "@/components/section";
import ShippingAddresses from "@/components/shipping-address";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { storage } from "@/lib/storage";

interface CartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  product_id: number;
  quantity: number;
  coupon_code: string | null;
  ecom_product: {
    id: number;
    price: number;
  };
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

// Fetcher function for SWR
const fetcher = async ( url: string ) => {
  const response = await fetch( url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${ storage.getToken() }`,
    },
  } );

  if ( !response.ok ) {
    throw new Error( "Failed to fetch cart items" );
  }

  return response.json();
};

export default function CheckoutPage() {
  const [ selectedAddressId, setSelectedAddressId ] = useState<number | null>( null );
  const [ discountAmount, setDiscountAmount ] = useState<number>( 0 );
  const [ baseTotal, setBaseTotal ] = useState<number>( 0 );
  const router = useRouter();

  // Fetch cart data
  const { data: cartData, error, isLoading } = useSWR<CartResponse>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart`,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: ( data ) => {
        if ( data.status && data.data ) {
          const total = data.data.reduce(
            ( sum, item ) => sum + item.ecom_product.price * item.quantity,
            0
          );
          setBaseTotal( total );
        }
      },
      onError: ( err ) => {
        console.error( "Failed to fetch cart:", err );
      },
    }
  );

  // Fetch user data (you might need to adjust this based on your auth setup)
  const { data: userData } = useSWR<UserData>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/user`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleAddressSelect = useCallback( ( shipping_address_id: number | null ) => {
    setSelectedAddressId( shipping_address_id );
  }, [] );

  const handleCouponApplied = useCallback( ( discount: number ) => {
    setDiscountAmount( discount > 0 ? discount : 0 );
  }, [] );

  const handleCouponRemoved = useCallback( () => {
    setDiscountAmount( 0 );
  }, [] );

  const handlePaymentSuccess = useCallback( ( response: any ) => {
    router.push(
      `/payment/success?order_id=${ response.mt_order_id }&transaction_id=${ response.razorpay_payment_id }&amount=${ orderTotal }`
    );
  }, [ router, baseTotal, discountAmount ] );

  const handlePaymentFailure = useCallback( ( error: any ) => {
    const errorMessage = error?.description || error?.message || "Payment failed";
    router.push(
      `/payment/failed?error=${ encodeURIComponent( errorMessage ) }&amount=${ orderTotal }`
    );
  }, [ router, baseTotal, discountAmount ] );

  const orderTotal = Math.max( 0, baseTotal - discountAmount );
  const isPaymentDisabled = !selectedAddressId || orderTotal <= 0;

  if ( isLoading ) {
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
          <h1 className="text-2xl font-bold mb-6" aria-label="Checkout page">
            Checkout
          </h1>

          { error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6" role="alert">
              Unable to load cart items. Please try again later.
            </div>
          ) }

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
                    onSelect={ handleAddressSelect }
                    selectedAddressId={ selectedAddressId }
                  />
                  { !selectedAddressId && (
                    <p className="text-red-500 text-sm mt-2">
                      Please select a shipping address to proceed.
                    </p>
                  ) }
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

                    <div className="flex justify-between font-medium border-t pt-4">
                      <span>Total</span>
                      <span>₹{ orderTotal.toFixed( 2 ) }</span>
                    </div>

                    <div className="pt-4">
                      <RazorpayButton
                        currency="INR"
                        type={ 4 }
                        product_type={ 2 }
                        shipping_address_id={ selectedAddressId }
                        amount={ orderTotal }
                        user={ userData || null }
                        onPaymentSuccess={ handlePaymentSuccess }
                        onPaymentFailure={ handlePaymentFailure }
                      />
                      { isPaymentDisabled && (
                        <p className="text-red-500 text-sm mt-2">
                          Please select a shipping address and ensure the total is
                          valid to proceed with payment.
                        </p>
                      ) }
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