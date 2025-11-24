"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authStorage } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.services";

const Schema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type FormData = z.infer<typeof Schema>;

interface VerifyOtpFormProps extends React.ComponentProps<"div"> {
  country_code?: string;
  phone?: string;
  onSuccess?: () => void;
}

export function VerifyOtpForm({ className, country_code, phone: propPhone, onSuccess, ...props }: VerifyOtpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use props if available, otherwise fallback to search params
  const countryCode = country_code || ("+" + searchParams.get("country_code"));
  const phone = propPhone || searchParams.get("phone");

  const [resendTimer, setResendTimer] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!countryCode || !phone) {
      // Only redirect if we are relying on search params and they are missing
      if (!country_code && !propPhone) {
        toast.error("Missing phone number information");
        router.push("/sign-in");
      }
    }

    const updateTimer = () => {
      const resendTime = authStorage.getResendTime() ?? 0;
      const remaining = Math.max(0, Math.ceil((resendTime - Date.now()) / 1000));
      setResendTimer(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [countryCode, phone, router, country_code, propPhone]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!countryCode || !phone) return;

      const payload = {
        country_code: countryCode,
        phone: phone,
        otp: data.otp,
        device_name: navigator.userAgent,
      };

      try {
        const res = await useAuthStore.getState().login(payload);

        if (res.success) {
          toast.success("Logged in successfully");
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/");
          }
        } else {
          toast.error(res.message ?? "Invalid OTP");
        }
      } catch (err: any) {
        const msg = err?.data?.message ?? "Failed to verify OTP";
        toast.error(msg);
      }
    },
    [countryCode, phone, router, onSuccess]
  );

  const handleResendOtp = useCallback(async () => {
    if (!countryCode || !phone) return;

    try {
      const res = await authService.resendOtp({
        country_code: countryCode,
        phone: phone,
      });

      if (res.success) {
        authStorage.setResendTime(Date.now() + 60000);
        setResendTimer(60);
        toast.success(res.message ?? "OTP resent successfully");
      } else {
        toast.error(res.message ?? "Failed to resend OTP");
      }
    } catch (err: any) {
      const msg = err?.data?.message ?? "Failed to resend OTP";
      toast.error(msg);
    }
  }, [countryCode, phone]);

  return (
    <div className={cn("flex min-h-screen bg-background", className)} {...props}>
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 md:py-0">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Verify your number
            </h1>
            <p className="text-base text-muted-foreground">
              We sent a code to <span className="font-semibold text-foreground">{countryCode} {phone}</span>
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Enter the 6-digit code
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                          <InputOTPSlot index={1} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                          <InputOTPSlot index={2} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                          <InputOTPSlot index={4} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                          <InputOTPSlot index={5} className="h-12 w-10 rounded-md border border-input bg-background text-lg font-semibold" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-sm" />
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
                {form.formState.isSubmitting ? "Verifying..." : "Verify"}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className="font-semibold text-foreground hover:text-foreground/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                </button>
              </div>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="#" className="underline hover:text-foreground transition-colors">
                Terms
              </Link>
              {" "}and{" "}
              <Link href="#" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
          <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border-white/20 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quick & Secure
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Your account is protected with enterprise-grade security.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Instant Verification</p>
                    <p className="text-white/70 text-xs">Get verified in seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">End-to-End Encrypted</p>
                    <p className="text-white/70 text-xs">Your data stays private</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">24/7 Support</p>
                    <p className="text-white/70 text-xs">Always here to help</p>
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
