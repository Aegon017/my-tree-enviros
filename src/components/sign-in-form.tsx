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

const FormSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Please enter a valid phone number",
    }),
});

type FormData = z.infer<typeof FormSchema>;

export function SigninForm({
  className,
  onOtpSent,
  ...props
}: React.ComponentProps<"div"> & {
  onOtpSent?: (data: { country_code: string; phone: string }) => void;
}) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      const phoneNumber = parsePhoneNumberFromString(data.phone);

      if (!phoneNumber) {
        toast.error("Invalid phone number format");
        return;
      }

      try {
        const result = await authService.signIn({
          country_code: `+${phoneNumber.countryCallingCode}`,
          phone: phoneNumber.nationalNumber,
        });

        if (result.success) {
          // Store OTP resend timer
          const resetTime = Date.now() + 60000;
          authStorage.setResendTime(resetTime);

          toast.success(
            result.message || "Verification code sent successfully",
          );

          // Inline OTP or navigate based on prop
          if (onOtpSent) {
            onOtpSent({
              country_code: phoneNumber.countryCallingCode,
              phone: phoneNumber.nationalNumber,
            });
          } else {
            router.push(
              `/verify-otp?country_code=${encodeURIComponent(phoneNumber.countryCallingCode)}&phone=${encodeURIComponent(phoneNumber.nationalNumber)}`,
            );
          }
        } else {
          toast.error(result.message || "Failed to send verification code");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          const serverError = error.response?.data;

          // Handle server-side validation errors
          if (serverError?.errors) {
            // Clear all existing errors first
            form.clearErrors();

            // Set server-side validation errors for specific fields
            Object.keys(serverError.errors).forEach((field) => {
              if (field in form.getValues()) {
                form.setError(field as keyof FormData, {
                  type: "server",
                  message: Array.isArray(serverError.errors[field])
                    ? serverError.errors[field].join(", ")
                    : serverError.errors[field],
                });
              }
            });

            // If there are general errors not associated with specific fields, show as toast
            if (serverError.message && !serverError.errors) {
              toast.error(serverError.message);
            }
          } else {
            toast.error(
              serverError?.message || "Failed to send verification code",
            );
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [router, form, onOtpSent],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center text-center">
                  <AppLogo />
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your My Tree Enviros account
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="IN"
                          international
                          placeholder="Enter your phone number"
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send a verification code to this number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting
                    ? "Sending Code..."
                    : "Send Verification Code"}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:grid place-content-center">
            <Image src={image} alt="My tree enviros" priority />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <Link
          href="#"
          className="hover:text-primary underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="hover:text-primary underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
