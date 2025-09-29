"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { Options } from "@/types/razorpay";
import { Button } from "./ui/button";

interface Props {
    options?: Options;
}

const PayButton = ( { options }: Props ) => {
    const handlePayment = useCallback( async () => {
        if ( !options ) {
            toast.error( "Payment options are missing." );
            return;
        }
        
        const rzp = new window.Razorpay( options );
        rzp.open();
    }, [ options ] );

    return (
        <Button onClick={ handlePayment }>Pay Now</Button>
    );
};

export default PayButton;