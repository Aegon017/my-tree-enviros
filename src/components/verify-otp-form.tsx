"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { authStorage } from "@/lib/auth-storage";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";

const OtpSchema = z.object( {
  otp: z
    .string()
    .length( 6, "OTP must be 6 digits" )
    .regex( /^\d+$/, "OTP must contain only numbers" ),
} );

type OtpFormData = z.infer<typeof OtpSchema>;

const verifyOtp = async (
  _url: string,
  { arg }: { arg: { mobile: string; otp: string } },
) => {
  const response = await api.post( "/api/verify-otp", arg );
  return response.data;
};

const resendOtp = async (
  _url: string,
  { arg }: { arg: { mobile: string } },
) => {
  const response = await api.post( "/api/resend-otp", arg );
  return response.data;
};

export function VerifyOtpForm( {
  className,
  ...props
}: React.ComponentProps<"div"> ) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get( "mobile" );
  const { login } = useAuth();

  const [ resendTimer, setResendTimer ] = useState( 0 );

  const form = useForm<OtpFormData>( {
    resolver: zodResolver( OtpSchema ),
    defaultValues: { otp: "" },
  } );

  const { trigger: verifyTrigger, isMutating: isVerifying } = useSWRMutation(
    "/api/verify-otp",
    verifyOtp,
  );
  const { trigger: resendTrigger, isMutating: isResending } = useSWRMutation(
    "/api/resend-otp",
    resendOtp,
  );

  useEffect( () => {
    const savedTime = authStorage.getResendTime();
    if ( savedTime ) {
      const timeLeft = Math.max( 0, Math.ceil( ( savedTime - Date.now() ) / 1000 ) );
      setResendTimer( timeLeft );
    }
  }, [] );

  useEffect( () => {
    if ( resendTimer <= 0 ) return;
    const timer = setTimeout( () => setResendTimer( resendTimer - 1 ), 1000 );
    return () => clearTimeout( timer );
  }, [ resendTimer ] );

  const onSubmit = useCallback(
    async ( data: OtpFormData ) => {
      if ( !mobile ) {
        toast.error( "Mobile number is missing" );
        return;
      }

      try {
        const result = await verifyTrigger( { mobile, otp: data.otp } );

        if ( result.status ) {
          login( result.data );
          authStorage.clearResendTime();
          toast.success( "OTP verified successfully" );
          router.push( "/" );
        } else {
          toast.error( result.message || "OTP verification failed" );
        }
      } catch ( error ) {
        toast.error(
          error instanceof Error ? error.message : "Unexpected error",
        );
      }
    },
    [ verifyTrigger, mobile, router, login ],
  );

  const handleResendOtp = useCallback( async () => {
    if ( !mobile || resendTimer > 0 ) return;

    try {
      const result = await resendTrigger( { mobile } );

      if ( result.status ) {
        const resetTime = Date.now() + 60000;
        authStorage.setResendTime( resetTime );
        setResendTimer( 60 );
        toast.success( "OTP resent successfully" );
      } else {
        toast.error( result.message || "Failed to resend OTP" );
      }
    } catch ( error ) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend OTP",
      );
    }
  }, [ mobile, resendTimer, resendTrigger ] );

  // Auto-submit when OTP is complete
  const handleComplete = useCallback( ( otp: string ) => {
    form.setValue( 'otp', otp );
    // Use setTimeout to ensure the form state is updated before submission
    setTimeout( () => {
      form.handleSubmit( onSubmit )();
    }, 100 );
  }, [ form, onSubmit ] );

  if ( !mobile ) {
    return (
      <div className={ cn( "flex flex-col gap-6", className ) } { ...props }>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex flex-col gap-6 items-center text-center">
              <AppLogo />
              <h1 className="text-2xl font-bold">Verification Error</h1>
              <p className="text-muted-foreground text-balance">
                Mobile number is missing. Please try again.
              </p>
              <Button
                onClick={ () => router.push( "/sign-in" ) }
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
            <div className="bg-muted relative hidden md:grid place-content-center">
              <Image src={ image } alt="My tree enviros" priority />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={ cn( "flex flex-col gap-6", className ) } { ...props }>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form { ...form }>
              <form
                onSubmit={ form.handleSubmit( onSubmit ) }
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center text-center">
                  <AppLogo />
                  <h1 className="text-2xl font-bold">Verify OTP</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter the verification code sent to { mobile }
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={ () => router.back() }
                    className="w-fit h-auto p-0 text-primary mt-2"
                  >
                    Edit mobile number
                  </Button>
                </div>

                <FormField
                  control={ form.control }
                  name="otp"
                  render={ ( { field } ) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-center w-full">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={ 6 }
                            { ...field }
                            onComplete={ handleComplete }
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={ 0 } />
                              <InputOTPSlot index={ 1 } />
                              <InputOTPSlot index={ 2 } />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={ 3 } />
                              <InputOTPSlot index={ 4 } />
                              <InputOTPSlot index={ 5 } />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormDescription className="text-center">
                        Please enter the 6-digit code sent to your phone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <Button type="submit" loading={isVerifying} disabled={ isVerifying } className="w-full">
                  Verify Code
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{ " " }
                  <button
                    type="button"
                    onClick={ handleResendOtp }
                    disabled={ resendTimer > 0 || isResending }
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    { isResending
                      ? "Resending..."
                      : resendTimer > 0
                        ? `Resend in ${ resendTimer }s`
                        : "Resend OTP" }
                  </button>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:grid place-content-center">
            <Image src={ image } alt="My tree enviros" priority />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{ " " }
        <Link href="#">Terms of Service</Link> and{ " " }
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}