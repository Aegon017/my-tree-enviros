"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import useSWRMutation from "swr/mutation";
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
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";

const FormSchema = z.object({
  mobile: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Please enter a valid phone number",
    }),
  referralCode: z.string().optional(),
  userType: z.enum(["1"]),
});

type SignUpPayload = {
  mobile_prefix: string;
  mobile: string;
  fcm_token: string;
  user_type: number;
  referral_code?: string;
};

type FormData = z.infer<typeof FormSchema>;

const signUpUser = async (url: string, { arg }: { arg: SignUpPayload }) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sign Up failed");
  }

  return response.json();
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: "",
      referralCode: "",
      userType: "1",
    },
  });

  const { trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/signup`,
    signUpUser,
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const phoneNumber = parsePhoneNumberFromString(data.mobile);
        if (!phoneNumber) {
          toast.error("Invalid phone number format");
          return;
        }

        const nationalNumber = phoneNumber.nationalNumber;
        const mobilePrefix = `+${phoneNumber.countryCallingCode || "91"}`;

        const payload = {
          mobile_prefix: mobilePrefix,
          mobile: nationalNumber,
          fcm_token: "GDFDFD86676HKKJGG",
          user_type: Number(data.userType),
          referral_code: data.referralCode || "",
        };

        const result = await trigger(payload);

        if (result.status === true) {
          const resetTime = Date.now() + 60000;
          storage.setResendTime(resetTime);

          toast.success(
            result.message || "Verification code sent successfully",
          );
          router.push(
            `/verify-otp?mobile=${encodeURIComponent(nationalNumber)}`,
          );
        } else {
          toast.error(result.message || "Failed to send verification code");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }
    },
    [trigger, router],
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
                  <h1 className="text-2xl font-bold">Create Account</h1>
                  <p className="text-muted-foreground text-balance">
                    Sign up for your My Tree Enviros account
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
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

                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter referral code"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden userType field */}
                <input type="hidden" {...form.register("userType")} />

                <Button type="submit" className="w-full" disabled={isMutating}>
                  {isMutating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isMutating ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign in
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
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
