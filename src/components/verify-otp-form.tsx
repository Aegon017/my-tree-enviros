"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import AppLogo from "@/components/ui/app-logo";
import image from "../../public/neem-tree.webp";
import { cn } from "@/lib/utils";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { useVerifyOtp } from "@/hooks/use-verify-otp";
import { useResendOtp } from "@/hooks/use-resend-otp";
import type { VerifyOtpPayload, PhonePayload } from "@/types/auth.types";

const Schema = z.object( {
  otp: z.string().length( 6 ).regex( /^\d+$/ ),
} );

type FormData = z.infer<typeof Schema>;

export function VerifyOtpForm( {
  className,
  country_code: ccProp,
  phone: phoneProp,
  onSuccess,
  ...props
}: React.ComponentProps<"div"> & {
  country_code?: string;
  phone?: string;
  onSuccess?: ( user: any ) => void;
} ) {
  const router = useRouter();
  const params = useSearchParams();

  const country_code = ccProp ?? params.get( "country_code" ) ?? "";
  const phone = phoneProp ?? params.get( "phone" ) ?? "";

  const { remaining, start } = useOtpTimer( 60 );
  const { verify } = useVerifyOtp( onSuccess );
  const { resend } = useResendOtp( start );

  const form = useForm<FormData>( {
    resolver: zodResolver( Schema ),
    defaultValues: { otp: "" },
  } );

  async function onSubmit( data: FormData ) {
    if ( !country_code || !phone ) return toast.error( "Missing phone information" );

    const payload: VerifyOtpPayload = {
      country_code: country_code.startsWith( "+" ) ? country_code : `+${ country_code }`,
      phone,
      otp: data.otp,
    };

    const user = await verify( payload );
    if ( user ) router.push( "/" );
  }

  async function handleResend() {
    if ( remaining > 0 ) return;

    const payload: PhonePayload = {
      country_code: country_code.startsWith( "+" ) ? country_code : `+${ country_code }`,
      phone,
    };

    await resend( payload );
  }

  const display =
    country_code && phone
      ? `${ country_code.startsWith( "+" ) ? country_code : `+${ country_code }` } ${ phone }`
      : "";

  if ( !country_code || !phone ) {
    return (
      <div className={ cn( "flex flex-col gap-6", className ) } { ...props }>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex flex-col gap-6 items-center text-center">
              <AppLogo />
              <h1 className="text-2xl font-bold">Verification Error</h1>
              <p className="text-muted-foreground text-balance">
                Missing phone number or country code. Please try again.
              </p>
              <Button onClick={ () => router.push( "/sign-in" ) } className="w-full max-w-xs">
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
              <form onSubmit={ form.handleSubmit( onSubmit ) } className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <AppLogo />
                  <h1 className="text-2xl font-bold">Verify OTP</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter the verification code sent to { display }
                  </p>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={ () => router.back() }
                    type="button"
                    className="w-fit h-auto p-0 text-primary mt-2"
                  >
                    Edit phone number
                  </Button>
                </div>

                <FormField
                  control={ form.control }
                  name="otp"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel className="text-center w-full block">Verification Code</FormLabel>
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
                      <FormMessage className="text-center" />
                    </FormItem>
                  ) }
                />

                <Button
                  type="submit"
                  disabled={ form.formState.isSubmitting }
                  className="w-full"
                  size="lg"
                >
                  { form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) }
                  { form.formState.isSubmitting ? "Verifying..." : "Verify Code" }
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{ " " }
                  <button
                    type="button"
                    onClick={ handleResend }
                    disabled={ remaining > 0 }
                    className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    { remaining > 0 ? `Resend in ${ remaining }s` : "Resend OTP" }
                  </button>
                </div>
              </form>
            </Form>
          </div>

          <div className="bg-muted relative hidden md:grid place-content-center">
            <Image src={ image } alt="My tree enviros" priority className="object-cover w-full h-full" />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{ " " }
        <Link href="#" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </Link>{ " " }
        and{ " " }
        <Link href="#" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}