"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/mobile";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authService } from "@/services/auth.services";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import image from "../../public/neem-tree.webp";
import AppLogo from "./ui/app-logo";

const accountTypes = ["individual", "organization"] as const;

const Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), "Please enter a valid phone number"),

  type: z.enum(accountTypes),
});

type FormData = z.infer<typeof Schema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      phone: "",
      type: "individual",
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
        type: data.type,
      } as const;

      try {
        const res = await authService.signUp(payload);

        if (res.success) {
          authStorage.setResendTime(Date.now() + 60000);

          toast.success(res.message ?? "Verification code sent successfully");

          router.push(
            `/verify-otp?country_code=${encodeURIComponent(parsed.countryCallingCode)}&phone=${encodeURIComponent(parsed.nationalNumber)}`
          );
        } else {
          toast.error(res.message ?? "Failed to send verification code");
        }
      } catch (err: any) {
        const msg = err?.data?.message ?? "Failed to send verification code";
        toast.error(msg);
      }
    },
    [router]
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <AppLogo />
                  <h1 className="text-2xl font-bold">Create Account</h1>
                  <p className="text-muted-foreground text-balance">
                    Sign up for your My Tree Enviros account
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <RadioGroupItem value="individual" />
                            </FormControl>
                            <FormLabel className="font-normal">Individual</FormLabel>
                          </FormItem>

                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <RadioGroupItem value="organization" />
                            </FormControl>
                            <FormLabel className="font-normal">Organization</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormDescription>We’ll send a verification code to this number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="underline underline-offset-4">
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