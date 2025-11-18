"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/mobile";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneInput } from "@/components/phone-input";
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
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";

const FormSchema = z.object( {
  phone: z
    .string()
    .min( 1, "Phone number is required" )
    .refine( ( value ) => isValidPhoneNumber( value ), {
      message: "Please enter a valid phone number",
    } ),
} );

type FormData = z.infer<typeof FormSchema>;

export function SignupForm( {
  className,
  ...props
}: React.ComponentProps<"div"> ) {
  const router = useRouter();

  const form = useForm<FormData>( {
    resolver: zodResolver( FormSchema ),
    defaultValues: {
      phone: "",
    },
  } );

  const onSubmit = useCallback(
    async ( data: FormData ) => {
      const phoneNumber = parsePhoneNumberFromString( data.phone );

      if ( !phoneNumber ) {
        toast.error( "Invalid phone number format" );
        return;
      }

      const payload = {
        country_code: `+${ phoneNumber.countryCallingCode }`,
        phone: phoneNumber.nationalNumber,
        type: "individual" as const,
      };

      try {
        const result = await authService.signUp( payload );

        if ( result.success ) {

          const resetTime = Date.now() + 60000;
          authStorage.setResendTime( resetTime );

          toast.success(
            result.message || "Verification code sent successfully",
          );


          router.push(
            `/verify-otp?country_code=${ encodeURIComponent( phoneNumber.countryCallingCode ) }&phone=${ encodeURIComponent( phoneNumber.nationalNumber ) }`,
          );
        } else {
          toast.error( result.message || "Failed to send verification code" );
        }
      } catch ( error ) {
        if ( error instanceof AxiosError ) {
          const serverError = error.response?.data;

          if ( serverError?.errors ) {
            form.clearErrors();

            Object.keys( serverError.errors ).forEach( ( field ) => {
              if ( field in form.getValues() ) {
                form.setError( field as keyof FormData, {
                  type: "server",
                  message: Array.isArray( serverError.errors[ field ] )
                    ? serverError.errors[ field ].join( ", " )
                    : serverError.errors[ field ],
                } );
              }
            } );

            if ( serverError.message && !serverError.errors ) {
              toast.error( serverError.message );
            }
          } else {
            toast.error(
              serverError?.message || "Failed to send verification code",
            );
          }
        } else {
          toast.error( "An unexpected error occurred" );
        }
      }
    },
    [ router, form ],
  );

  return (
    <Card className="overflow-hidden p-0">
      <CardContent>
        <div className="p-6 md:p-8">
          <Form { ...form }>
            <form
              onSubmit={ form.handleSubmit( onSubmit ) }
              className="flex flex-col gap-6"
            >
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
                    <FormDescription>
                      We'll send a verification code to this number
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                ) }
              />
              <Button
                type="submit"
                className="w-full"
                disabled={ form.formState.isSubmitting }
              >
                { form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) }
                { form.formState.isSubmitting
                  ? "Creating Account..."
                  : "Create Account" }
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
