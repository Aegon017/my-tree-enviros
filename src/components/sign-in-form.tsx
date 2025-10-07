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
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";
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
});

type FormData = z.infer<typeof FormSchema>;

const signInUser = async (
  _url: string,
  { arg }: { arg: { mobile: string } },
) => {
  const response = await api.post("/api/signin", arg);
  return response.data;
};

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { mobile: "" },
  });

  const { trigger, isMutating } = useSWRMutation("/api/signin", signInUser);

  const onSubmit = useCallback(
    async (data: FormData) => {
      const phoneNumber = parsePhoneNumberFromString(data.mobile);

      if (!phoneNumber) {
        toast.error("Invalid phone number format");
        return;
      }

      const nationalNumber = phoneNumber.nationalNumber;

      try {
        const result = await trigger({ mobile: nationalNumber });

        if (result.status) {
          if (result.data) login(result.data);

          const resetTime = Date.now() + 60000;
          localStorage.setItem("otpResendTime", resetTime.toString());

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
          error instanceof Error ? error.message : "Unexpected error",
        );
      }
    },
    [trigger, router, login],
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

                <Button type="submit" className="w-full" disabled={isMutating}>
                  {isMutating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isMutating ? "Sending Code..." : "Send Verification Code"}
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

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
