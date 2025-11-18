"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString, isValidPhoneNumber } from "libphonenumber-js/mobile";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AppLogo from "@/components/ui/app-logo";
import { useSendOtp } from "@/hooks/use-send-otp";
import type { PhonePayload } from "@/types/auth.types";
import image from "../../public/neem-tree.webp";

const Schema = z.object( {
  phone: z
    .string()
    .min( 1, "Phone number is required" )
    .refine( v => isValidPhoneNumber( v ), "Please enter a valid phone number" ),
} );

type FormData = z.infer<typeof Schema>;

export function SigninForm( { className, onOtpSent, ...props }: React.ComponentProps<"div"> & { onOtpSent?: ( data: PhonePayload ) => void } ) {
  const router = useRouter();
  const { sendOtp } = useSendOtp( ( payload ) => {
    if ( !onOtpSent ) {
      router.push(
        `/verify-otp?country_code=${ encodeURIComponent( payload.country_code ) }&phone=${ encodeURIComponent( payload.phone ) }`
      );
    }
    onOtpSent?.( payload );
  } );

  const form = useForm<FormData>( {
    resolver: zodResolver( Schema ),
    defaultValues: { phone: "" },
  } );

  async function onSubmit( data: FormData ) {
    const parsed = parsePhoneNumberFromString( data.phone );
    if ( !parsed ) return toast.error( "Invalid phone number format" );

    const payload: PhonePayload = {
      country_code: `+${ parsed.countryCallingCode }`,
      phone: parsed.nationalNumber,
    };

    try {
      await sendOtp( payload );
    } catch ( err: any ) {
      const msg = err?.body?.message || "Failed to send verification code";
      toast.error( msg );
    }
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
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">Login to your My Tree Enviros account</p>
                </div>

                <FormField
                  control={ form.control }
                  name="phone"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={ field.value }
                          onChange={ field.onChange }
                          defaultCountry="IN"
                          international
                          placeholder="Enter your phone number"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <Button type="submit" className="w-full" disabled={ form.formState.isSubmitting }>
                  { form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                  { form.formState.isSubmitting ? "Sending Code..." : "Send Verification Code" }
                </Button>

                <div className="text-center text-sm">
                  Don’t have an account? <Link href="/sign-up" className="underline underline-offset-4">Sign up</Link>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:grid place-content-center">
            <Image src={ image } alt="My tree enviros" priority />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our <Link href="#" className="hover:text-primary underline underline-offset-4">Terms of Service</Link> and <Link href="#" className="hover:text-primary underline underline-offset-4">Privacy Policy</Link>.
      </div>
    </div>
  );
}