"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkoutService } from "@/modules/checkout/services/checkout.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function PhonePeCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            const merchantId = searchParams.get("merchantId");
            const providerReferenceId = searchParams.get("providerReferenceId");
            const transactionId = searchParams.get("transactionId");
            const idToVerify = searchParams.get("merchantTransactionId")
                ?? searchParams.get("merchantOrderId")
                ?? transactionId;

            if (idToVerify) {
                try {
                    await checkoutService.verify({
                        code: code ?? undefined,
                        merchantId: merchantId ?? undefined,
                        providerReferenceId: providerReferenceId ?? undefined,
                        transaction_id: idToVerify,
                    });

                    toast.success("Payment successful");
                    const orderId = idToVerify.split('-')[1];
                    router.push(`/payment/success?order_id=${orderId}`);
                } catch (error) {
                    toast.error("Payment verification failed");
                    router.push("/payment/failure?reason=verification_failed");
                }
            } else {
                toast.error("Invalid response from payment gateway");
                router.push("/payment/failure?reason=invalid_callback_params");
            }
            setVerifying(false);
        };

        verifyPayment();
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Verifying Payment...</p>
            <p className="text-muted-foreground">Please do not close this window.</p>
        </div>
    );
}

export default function PhonePeCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <PhonePeCallbackContent />
        </Suspense>
    );
}
