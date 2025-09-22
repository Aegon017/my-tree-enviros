import { useState } from 'react';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';
import { Button } from './ui/button';

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

declare global {
    interface Window {
        Razorpay: new ( options: RazorpayOptions ) => {
            open: () => void;
            on: ( event: string, callback: ( error: any ) => void ) => void;
        };
    }
}

interface RazorpayButtonProps {
    currency: string;
    type: number;
    product_type: number;
    shipping_address_id: number | null;
    amount: number;
    onPaymentSuccess: ( response: any ) => void;
    onPaymentFailure: ( error: any ) => void;
}

interface OrderResponse {
    amount: number;
    currency: string;
    order_id: string;
    errors?: Record<string, string[]>;
    message?: string;
}

const RazorpayButton = ( {
    currency,
    type,
    product_type,
    shipping_address_id,
    amount,
    onPaymentSuccess,
    onPaymentFailure
}: RazorpayButtonProps ) => {
    const [ loading, setLoading ] = useState<boolean>( false );

    const displayRazorpay = async (): Promise<void> => {
        if ( !shipping_address_id ) {
            toast.error('Please select a shipping address');
            return;
        }

        setLoading( true );

        try {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ storage.getToken() }`
                },
                body: JSON.stringify( {
                    currency,
                    type: Number( type ),
                    product_type: Number( product_type ),
                    shipping_address_id: Number( shipping_address_id )
                } )
            } );

            const data: OrderResponse = await response.json();

            if ( !response.ok ) {
                const errorMsg = data.errors
                    ? Object.values( data.errors ).flat().join( ', ' )
                    : data.message || 'Failed to create order';
                throw new Error( errorMsg );
            }

            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: data.amount,
                currency: data.currency,
                order_id: data.order_id,
                name: 'Your Company Name',
                description: 'Payment for your order',
                image: 'https://example.com/your_logo.png',
                handler: onPaymentSuccess,
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999'
                },
                notes: {
                    address: 'Your Company Address'
                },
                theme: {
                    color: '#3399CC'
                }
            };

            const rzp1 = new window.Razorpay( options );
            rzp1.on( 'payment.failed', onPaymentFailure );
            rzp1.open();
        } catch ( error: unknown ) {
            const errorMessage = error instanceof Error ? error.message : 'Error initiating payment';
            toast.error(errorMessage);
            onPaymentFailure( error );
        } finally {
            setLoading( false );
        }
    };

    return (
        <Button
            onClick={ displayRazorpay }
            disabled={ loading || !shipping_address_id }
            className="w-full"
        >
            { loading ? 'Processing...' : `Pay ₹${ ( amount / 100 ).toFixed( 2 ) }` }
        </Button>
    );
};

export default RazorpayButton;