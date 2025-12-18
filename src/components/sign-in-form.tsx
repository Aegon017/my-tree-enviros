"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/mobile";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/auth.services";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { GoogleSignInButton } from "./google-signin-button";

const Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => isValidPhoneNumber(value),
      "Please enter a valid phone number",
    ),
});

type FormData = z.infer<typeof Schema>;

interface SigninFormProps extends React.ComponentProps<"div"> {
  onOtpSent?: (data: { country_code: string; phone: string }) => void;
}

export function SigninForm({
  className,
  onOtpSent,
  ...props
}: SigninFormProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      const parsed = parsePhoneNumberFromString(data.phone);

      if (!parsed) {
        toast.error("Invalid phone number format");
        return;
      }

      const payload = {
        country_code: `+${parsed.countryCallingCode}`,
        phone: parsed.nationalNumber,
      };

      try {
        const res = await authService.signIn(payload);

        if (res.success) {
          authStorage.setResendTime(Date.now() + 60000);
          toast.success(res.message ?? "Verification code sent successfully");

          if (onOtpSent) {
            onOtpSent({
              country_code: `+${parsed.countryCallingCode}`,
              phone: parsed.nationalNumber,
            });
          } else {
            router.push(
              `/verify-otp?country_code=${encodeURIComponent(parsed.countryCallingCode)}&phone=${encodeURIComponent(parsed.nationalNumber)}`,
            );
          }
        } else {
          toast.error(res.message ?? "Failed to send verification code");
        }
      } catch (err: any) {
        const msg = err?.data?.message ?? "Failed to send verification code";
        toast.error(msg);
      }
    },
    [router, onOtpSent],
  );

  return (
    <div className={cn("flex bg-background", className)} {...props}>
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-base text-muted-foreground">
              Sign in to your My Tree Enviros account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Phone Number
                    </FormLabel>
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
                    <FormDescription className="text-xs">
                      We'll send a verification code to this number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-11 font-semibold"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.formState.isSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>

              <GoogleSignInButton />

              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-foreground hover:text-foreground/80 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link
                href="#"
                className="underline hover:text-foreground transition-colors"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="underline hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-primary to-primary/80 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
          <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border-white/20 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Continue your environmental journey with us.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Secure Access
                    </p>
                    <p className="text-white/70 text-xs">
                      Your account is fully protected
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Your Progress
                    </p>
                    <p className="text-white/70 text-xs">
                      View all your achievements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Stay Connected
                    </p>
                    <p className="text-white/70 text-xs">
                      Engage with the community
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
