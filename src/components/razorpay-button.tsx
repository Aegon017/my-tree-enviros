"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { storage } from "@/lib/storage";
import { Button } from "./ui/button";

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image: string;
  handler: ( response: any ) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayButtonProps {
  currency: string;
  type: number;
  product_type: number;
  shipping_address_id: number | null;
  amount: number;
  user: {
    email: string;
    mobile: string;
    name: string;
  } | null;
  onPaymentSuccess: ( response: any ) => void;
  onPaymentFailure: ( error: any ) => void;
}

interface OrderResponse {
  status: boolean;
  data: {
    mt_order_id: string;
    razorpay_order_id: string;
  };
  errors?: Record<string, string[]>;
  message?: string;
}

interface CheckoutCallbackResponse {
  status: boolean;
  data: any;
}

async function checkoutRequest(
  url: string,
  { arg }: { arg: any }
): Promise<OrderResponse> {
  const token = storage.getToken();
  if ( !token ) {
    throw new Error( "No authentication token found" );
  }

  const response = await fetch( url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${ token }`,
    },
    body: JSON.stringify( arg ),
  } );

  const data = await response.json();

  if ( !response.ok ) {
    const errorMsg = data.errors
      ? Object.values( data.errors ).flat().join( ", " )
      : data.message || "Failed to create order";
    throw new Error( errorMsg );
  }

  return data;
}

async function checkoutCallbackRequest(
  url: string,
  { arg }: { arg: any }
): Promise<CheckoutCallbackResponse> {
  const token = storage.getToken();
  if ( !token ) {
    throw new Error( "No authentication token found" );
  }

  const response = await fetch( url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${ token }`,
    },
    body: JSON.stringify( arg ),
  } );

  const data = await response.json();

  if ( !response.ok ) {
    const errorMsg = data.errors
      ? Object.values( data.errors ).flat().join( ", " )
      : data.message || "Failed to process payment callback";
    throw new Error( errorMsg );
  }

  return data;
}

const RazorpayButton = ( {
  currency,
  type,
  product_type,
  shipping_address_id,
  amount,
  user,
  onPaymentSuccess,
  onPaymentFailure,
}: RazorpayButtonProps ) => {
  const [ isProcessing, setIsProcessing ] = useState( false );

  const { trigger: triggerCheckout } = useSWRMutation(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/checkout`,
    checkoutRequest
  );

  const { trigger: triggerCallback } = useSWRMutation(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/payment/callback`,
    checkoutCallbackRequest
  );

  const handlePayment = async (): Promise<void> => {
    if ( !shipping_address_id ) {
      toast.error( "Please select a shipping address" );
      return;
    }

    if ( amount <= 0 ) {
      toast.error( "Invalid amount for payment" );
      return;
    }

    if ( isProcessing ) return;
    setIsProcessing( true );

    try {
      const orderData = await triggerCheckout( {
        currency,
        type: Number( type ),
        product_type: Number( product_type ),
        shipping_address_id: Number( shipping_address_id ),
        cart_type: 1,
      } );

      if ( !orderData.status ) {
        throw new Error( orderData.message || "Failed to create order" );
      }

      // Check if Razorpay is available
      if ( !window.Razorpay ) {
        throw new Error( "Razorpay SDK not loaded" );
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round( amount * 100 ), // Convert to paise
        currency: currency,
        order_id: orderData.data.razorpay_order_id,
        name: process.env.NEXT_PUBLIC_APP_NAME || "My Tree",
        description: "Credits towards My Tree Enviros",
        image: "/logo.png",
        handler: async ( response ) => {
          try {
            const callbackData = await triggerCallback( {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: 4,
            } );

            if ( callbackData.status ) {
              onPaymentSuccess( {
                ...callbackData.data,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              } );
              toast.success( "Payment successful!" );
            } else {
              throw new Error( "Payment verification failed" );
            }
          } catch ( error ) {
            const errorMessage =
              error instanceof Error ? error.message : "Payment verification failed";
            toast.error( errorMessage );
            onPaymentFailure( error );
          } finally {
            setIsProcessing( false );
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },
        notes: {
          address: "",
        },
        theme: {
          color: "#35a150",
        },
      };

      const rzp1 = new window.Razorpay( options );

      // Handle payment failure
      rzp1.on( "payment.failed", ( error ) => {
        toast.error( "Payment failed. Please try again." );
        onPaymentFailure( error );
        setIsProcessing( false );
      } );

      // Handle modal close without payment
      rzp1.on( "payment.modal.closed", () => {
        setIsProcessing( false );
      } );

      rzp1.open();

    } catch ( error: unknown ) {
      const errorMessage =
        error instanceof Error ? error.message : "Error processing payment";
      toast.error( errorMessage );
      onPaymentFailure( error );
      setIsProcessing( false );
    }
  };

  return (
    <Button
      onClick={ handlePayment }
      disabled={ isProcessing || !shipping_address_id || amount <= 0 }
      className="w-full"
      aria-label={ `Pay ₹${ amount.toFixed( 2 ) } via Razorpay` }
    >
      { isProcessing ? "Processing..." : `Pay Now - ₹${ amount.toFixed( 2 ) }` }
    </Button>
  );
};

export default RazorpayButton;