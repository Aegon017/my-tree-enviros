"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";
import { useAuth } from "@/hooks/use-auth";

const OtpSchema = z.object( {
  otp: z.string().length( 6 ).regex( /^\d+$/ ),
} );

type OtpFormData = z.infer<typeof OtpSchema>;

export function VerifyOtpForm( {
  className,
  country_code: propCountryCode,
  phone: propPhone,
  onSuccess,
  ...props
}: React.ComponentProps<"div"> & {
  country_code?: string;
  phone?: string;
  onSuccess?: ( user: any ) => void;
} ) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const country_code = propCountryCode ?? searchParams.get( "country_code" );
  const phone = propPhone ?? searchParams.get( "phone" );

  const [ resendTimer, setResendTimer ] = useState( 0 );
  const [ isResending, setIsResending ] = useState( false );

  const form = useForm<OtpFormData>( {
    resolver: zodResolver( OtpSchema ),
    defaultValues: { otp: "" },
  } );

  useEffect( () => {
    const saved = authStorage.getResendTime();
    if ( saved ) {
      const left = Math.max( 0, Math.ceil( ( saved - Date.now() ) / 1000 ) );
      setResendTimer( left );
    }
  }, [] );

  useEffect( () => {
    if ( resendTimer <= 0 ) return;
    const t = setTimeout( () => setResendTimer( resendTimer - 1 ), 1000 );
    return () => clearTimeout( t );
  }, [ resendTimer ] );

  const onSubmit = useCallback(
    async ( data: OtpFormData ) => {
      if ( !phone || !country_code ) {
        toast.error( "Missing phone." );
        return;
      }

      const cc = country_code.startsWith( "+" ) ? country_code : `+${ country_code }`;

      try {
        const res = await authService.verifyOtp( {
          country_code: cc,
          phone,
          otp: data.otp,
        } );

        if ( res.success && res.data?.user ) {
          toast.success( "OTP verified" );

          if ( onSuccess ) onSuccess( res.data.user );
          else router.push( "/" );
        } else {
          toast.error( res.message || "OTP failed" );
        }
      } catch ( error: any ) {
        toast.error( error?.body?.message || "OTP failed" );
      }
    },
    [ phone, country_code, router ],
  );

  const handleResend = useCallback( async () => {
    if ( !phone || !country_code || resendTimer > 0 || isResending ) return;

    const cc = country_code.startsWith( "+" ) ? country_code : `+${ country_code }`;
    setIsResending( true );

    try {
      const res = await authService.resendOtp( { country_code: cc, phone } );

      if ( res.success ) {
        const ts = Date.now() + 60000;
        authStorage.setResendTime( ts );
        setResendTimer( 60 );
        toast.success( "OTP resent" );
      } else {
        toast.error( res.message || "Failed to resend" );
      }
    } catch ( error: any ) {
      toast.error( error?.body?.message || "Failed to resend" );
    } finally {
      setIsResending( false );
    }
  }, [ country_code, phone, resendTimer, isResending ] );

  const displayPhone = country_code && phone ? `${ country_code } ${ phone }` : "";

  if ( !phone || !country_code ) {
    return (
      <div className={ cn( "flex flex-col gap-6", className ) } { ...props }>
        <Card>
          <CardContent className="grid md:grid-cols-2 p-0">
            <div className="p-8 flex flex-col gap-6 text-center">
              <AppLogo />
              <h1 className="text-2xl font-bold">Verification Error</h1>
              <p className="text-muted-foreground">Invalid phone.</p>
              <Button onClick={ () => router.push( "/sign-in" ) } className="w-full">
                Back to Sign In
              </Button>
            </div>
            <div className="hidden md:grid place-content-center bg-muted">
              <Image src={ image } alt="" priority />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={ cn( "flex flex-col gap-6", className ) } { ...props }>
      <Card>
        <CardContent className="grid md:grid-cols-2 p-0">
          <div className="p-8">
            <Form { ...form }>
              <form onSubmit={ form.handleSubmit( onSubmit ) } className="flex flex-col gap-6">
                <div className="text-center flex flex-col gap-2">
                  <AppLogo />
                  <h1 className="text-2xl font-bold">Verify OTP</h1>
                  <p className="text-muted-foreground">Code sent to { displayPhone }</p>
                </div>

                <FormField
                  control={ form.control }
                  name="otp"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel className="text-center">Verification Code</FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP maxLength={ 6 } { ...field }>
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
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <Button type="submit" disabled={ form.formState.isSubmitting } className="w-full">
                  { form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) }
                  { form.formState.isSubmitting ? "Verifying..." : "Verify" }
                </Button>

                <div className="text-center text-sm">
                  Didn’t get it?
                  <button
                    type="button"
                    onClick={ handleResend }
                    disabled={ resendTimer > 0 || isResending }
                    className="ml-1 text-primary disabled:opacity-50"
                  >
                    { isResending ? "Resending..." : resendTimer > 0 ? `Resend in ${ resendTimer }s` : "Resend OTP" }
                  </button>
                </div>
              </form>
            </Form>
          </div>

          <div className="hidden md:grid place-content-center bg-muted">
            <Image src={ image } alt="" priority />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}