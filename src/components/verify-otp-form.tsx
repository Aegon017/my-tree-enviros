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
import { authService } from "@/services/auth.services";
import { authStorage } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";

const Schema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type FormData = z.infer<typeof Schema>;

export function VerifyOtpForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryCode = "+" + searchParams.get("country_code");
  const phone = searchParams.get("phone");

  const [resendTimer, setResendTimer] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!countryCode || !phone) {
      toast.error("Missing phone number information");
      router.push("/sign-in");
    }

    const updateTimer = () => {
      const resendTime = authStorage.getResendTime() ?? 0;
      const remaining = Math.max(0, Math.ceil((resendTime - Date.now()) / 1000));
      setResendTimer(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [countryCode, phone, router]);

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
          router.push("/");
        } else {
          toast.error(res.message ?? "Invalid OTP");
        }
      } catch (err: any) {
        const msg = err?.data?.message ?? "Failed to verify OTP";
        toast.error(msg);
      }
    },
    [countryCode, phone, router]
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Verify OTP</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter the 6-digit code sent to {countryCode} {phone}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field} >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your phone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting ? "Verifying..." : "Verify"}
                </Button>

                <div className="text-center text-sm">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            </Form>
          </div>

          <div className="bg-muted relative hidden md:grid place-content-center">
            <AppLogo className="h-60 w-60"/>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <Link href="#" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}