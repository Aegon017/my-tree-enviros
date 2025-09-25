"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { ApplyCoupon } from "@/components/apply-coupon";
import RazorpayButton from "@/components/razorpay-button";
import Section from "@/components/section";
import ShippingAddresses from "@/components/shipping-address";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { storage } from "@/lib/storage";

interface PriceInfo {
  id: number;
  tree_id?: number;
  duration?: number;
  price: string;
  created_at: string;
  updated_at: string;
}

interface TreeProduct {
  id: number;
  price: PriceInfo[];
}

interface EcomProduct {
  id: number;
  price: number;
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
  product?: TreeProduct;
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

const fetcher = async ( url: string ) => {
  const token = storage.getToken();
  if ( !token ) throw new Error( "No authentication token" );

  const response = await fetch( url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${ token }`,
    },
  } );

  if ( !response.ok ) throw new Error( "Failed to fetch data" );
  return response.json();
};

const calculateItemPrice = ( item: CartItem ): number => {
  if ( item.product_type === 2 && item.ecom_product ) {
    return item.ecom_product.price * item.quantity;
  }

  if ( item.product_type === 1 && item.product?.price?.length ) {
    const priceInfo = item.duration
      ? item.product.price.find( p => p.duration === item.duration )
      : item.product.price[ 0 ];

    return priceInfo ? parseFloat( priceInfo.price ) * item.quantity : 0;
  }

  return 0;
};

export default function CheckoutPage() {
  const router = useRouter();

  const { data: cartData, error, isLoading } = useSWR<CartResponse>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: userData } = useSWR<UserData>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/user`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const cartItems = cartData?.status ? cartData.data : [];

  const { baseTotal, hasTreeProducts, hasEcomProducts } = useMemo( () => {
    const total = cartItems.reduce( ( sum, item ) => sum + calculateItemPrice( item ), 0 );
    const hasTree = cartItems.some( item => item.product_type === 1 );
    const hasEcom = cartItems.some( item => item.product_type === 2 );
    return { baseTotal: total, hasTreeProducts: hasTree, hasEcomProducts: hasEcom };
  }, [ cartItems ] );

  const handlePaymentSuccess = useCallback( ( response: any ) => {
    router.push(
      `/payment/success?order_id=${ response.mt_order_id }&transaction_id=${ response.razorpay_payment_id }&amount=${ response.amount }`
    );
  }, [ router ] );

  const handlePaymentFailure = useCallback( ( error: any ) => {
    const errorMessage = error?.description || error?.message || "Payment failed";
    router.push( `/payment/failed?error=${ encodeURIComponent( errorMessage ) }` );
  }, [ router ] );

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

  if ( error || !cartData?.status ) {
    return (
      <AppLayout>
        <Section>
          <div className="container mx-auto p-6">
            <div className="bg-red-100 text-red-700 p-4 rounded" role="alert">
              Unable to load cart items. Please try again later.
            </div>
          </div>
        </Section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section>
        <CheckoutContent
          cartItems={ cartItems }
          userData={ userData }
          baseTotal={ baseTotal }
          hasTreeProducts={ hasTreeProducts }
          hasEcomProducts={ hasEcomProducts }
          onPaymentSuccess={ handlePaymentSuccess }
          onPaymentFailure={ handlePaymentFailure }
        />
      </Section>
    </AppLayout>
  );
}

interface CheckoutContentProps {
  cartItems: CartItem[];
  userData?: UserData;
  baseTotal: number;
  hasTreeProducts: boolean;
  hasEcomProducts: boolean;
  onPaymentSuccess: ( response: any ) => void;
  onPaymentFailure: ( error: any ) => void;
}

function CheckoutContent( {
  cartItems,
  userData,
  baseTotal,
  hasTreeProducts,
  hasEcomProducts,
  onPaymentSuccess,
  onPaymentFailure
}: CheckoutContentProps ) {
  const [ selectedAddressId, setSelectedAddressId ] = useState<number | null>( null );
  const [ discountAmount, setDiscountAmount ] = useState( 0 );

  const applicableDiscount = hasEcomProducts ? discountAmount : 0;
  const orderTotal = Math.max( 0, baseTotal - applicableDiscount );

  const isPaymentDisabled = useMemo( () => {
    if ( orderTotal <= 0 ) return true;
    if ( hasEcomProducts && !selectedAddressId ) return true;
    return false;
  }, [ hasEcomProducts, selectedAddressId, orderTotal ] );

  const handleAddressSelect = useCallback( ( shipping_address_id: number | null ) => {
    setSelectedAddressId( shipping_address_id );
  }, [] );

  const handleCouponApplied = useCallback( ( discount: number ) => {
    setDiscountAmount( Math.max( 0, discount ) );
  }, [] );

  const handleCouponRemoved = useCallback( () => {
    setDiscountAmount( 0 );
  }, [] );

  const cartType = 1;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ShippingSection
            selectedAddressId={ selectedAddressId }
            onAddressSelect={ handleAddressSelect }
          />
        </div>

        <div className="space-y-6">
          { hasEcomProducts && (
            <ApplyCoupon
              onCouponApplied={ handleCouponApplied }
              onCouponRemoved={ handleCouponRemoved }
              currentTotal={ baseTotal }
            />
          ) }

          <OrderSummary
            cartItems={ cartItems }
            baseTotal={ baseTotal }
            discountAmount={ discountAmount }
            orderTotal={ orderTotal }
            hasEcomProducts={ hasEcomProducts }
            hasTreeProducts={ hasTreeProducts }
            isPaymentDisabled={ isPaymentDisabled }
            selectedAddressId={ selectedAddressId }
            userData={ userData }
            cartType={ cartType }
            onPaymentSuccess={ onPaymentSuccess }
            onPaymentFailure={ onPaymentFailure }
          />
        </div>
      </div>
    </div>
  );
}

function ShippingSection( { selectedAddressId, onAddressSelect }: {
  selectedAddressId: number | null;
  onAddressSelect: ( id: number | null ) => void;
} ) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
        <CardDescription>Select your shipping address</CardDescription>
      </CardHeader>
      <CardContent>
        <ShippingAddresses onSelect={ onAddressSelect } selectedAddressId={ selectedAddressId } />
        { !selectedAddressId && (
          <p className="text-red-500 text-sm mt-2">Please select a shipping address to proceed.</p>
        ) }
      </CardContent>
    </Card>
  );
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  baseTotal: number;
  discountAmount: number;
  orderTotal: number;
  hasEcomProducts: boolean;
  hasTreeProducts: boolean;
  isPaymentDisabled: boolean;
  selectedAddressId: number | null;
  userData?: UserData;
  cartType: number;
  onPaymentSuccess: ( response: any ) => void;
  onPaymentFailure: ( error: any ) => void;
}

function OrderSummary( {
  cartItems,
  baseTotal,
  discountAmount,
  orderTotal,
  hasEcomProducts,
  hasTreeProducts,
  isPaymentDisabled,
  selectedAddressId,
  userData,
  cartType,
  onPaymentSuccess,
  onPaymentFailure
}: OrderSummaryProps ) {
  const primaryCartItem = cartItems[ 0 ];

  const razorpayProps = {
    currency: "INR",
    type: primaryCartItem?.type || 1,
    product_type: primaryCartItem?.product_type || 1,
    cart_type: cartType,
    shipping_address_id: hasEcomProducts ? selectedAddressId : undefined,
    amount: orderTotal,
    user: userData || null,
    onPaymentSuccess,
    onPaymentFailure
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          { cartItems.map( ( item ) => (
            <div key={ item.id } className="flex justify-between text-sm">
              <span>
                { item.product_type === 1 ? 'Tree Sponsorship' : 'Product' }
                { item.quantity > 1 && ` × ${ item.quantity }` }
                { item.duration && ` (${ item.duration } year)` }
              </span>
              <span>₹{ calculateItemPrice( item ).toFixed( 2 ) }</span>
            </div>
          ) ) }

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{ baseTotal.toFixed( 2 ) }</span>
          </div>

          { hasEcomProducts && discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{ discountAmount.toFixed( 2 ) }</span>
            </div>
          ) }

          { !hasEcomProducts && hasTreeProducts && (
            <div className="text-sm text-gray-500 italic">
              Coupons are not applicable for tree sponsorship items.
            </div>
          ) }

          <div className="flex justify-between font-medium border-t pt-4">
            <span>Total</span>
            <span>₹{ orderTotal.toFixed( 2 ) }</span>
          </div>

          <div className="pt-4">
            <RazorpayButton { ...razorpayProps } disabled={ isPaymentDisabled } />
            { isPaymentDisabled && (
              <p className="text-red-500 text-sm mt-2">
                { hasEcomProducts && !selectedAddressId
                  ? "Please select a shipping address to proceed with payment."
                  : orderTotal <= 0
                    ? "Order total must be greater than zero."
                    : "Unable to process payment at this time." }
              </p>
            ) }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}