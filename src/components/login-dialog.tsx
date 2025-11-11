"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { SigninForm } from "@/components/sign-in-form";
import { VerifyOtpForm } from "@/components/verify-otp-form";

export function LoginDialog( { open, onOpenChange, onSuccess }: {
    open: boolean;
    onOpenChange: ( open: boolean ) => void;
    onSuccess?: () => void;
} ) {
    const [ otpStep, setOtpStep ] = useState<"signin" | "verify">( "signin" );
    const [ otpCC, setOtpCC ] = useState<string>();
    const [ otpPhone, setOtpPhone ] = useState<string>();

    const handleSuccess = () => {
        onOpenChange( false );
        setOtpStep( "signin" );
        onSuccess?.();
    };

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Login to continue</DialogTitle>
                </DialogHeader>

                { otpStep === "signin" ? (
                    <SigninForm
                        onOtpSent={ ( { country_code, phone } ) => {
                            setOtpCC( country_code );
                            setOtpPhone( phone );
                            setOtpStep( "verify" );
                        } }
                    />
                ) : (
                    <VerifyOtpForm
                        country_code={ otpCC }
                        phone={ otpPhone }
                        onSuccess={ handleSuccess }
                    />
                ) }
            </DialogContent>
        </Dialog>
    );
}