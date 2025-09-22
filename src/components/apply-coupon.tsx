"use client";

import { useState } from "react";
import useSWRMutation from "swr/mutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

interface ApplyCouponProps {
  onCouponApplied: (discount: number, newTotal: number) => void;
  onCouponRemoved: () => void;
  currentTotal: number;
}

// Fetcher function for SWR mutation
async function applyCouponFetcher(
  url: string,
  { arg }: { arg: { coupon_code: string } },
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${storage.getToken()}`,
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to apply coupon");
  }

  return response.json();
}

export function ApplyCoupon({
  onCouponApplied,
  onCouponRemoved,
  currentTotal,
}: ApplyCouponProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const { trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart/apply-coupon-all`,
    applyCouponFetcher,
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const data = await trigger({ coupon_code: couponCode });

      setAppliedCoupon(couponCode);
      setDiscountAmount(data.data.total_discount_amount);

      const newTotal = currentTotal - data.data.total_discount_amount;
      onCouponApplied(data.data.total_discount_amount, newTotal);

      toast.success(`Successfully applied ${couponCode} coupon`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to apply coupon",
      );
    }
  };

  const handleChangeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    onCouponRemoved();
    toast.info("You can now enter a new coupon code");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply Coupon</CardTitle>
        <CardDescription>
          Enter your coupon code to get discounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={isMutating || !!appliedCoupon}
            />
            {appliedCoupon ? (
              <Button
                onClick={handleChangeCoupon}
                disabled={isMutating}
                variant="outline"
              >
                Change
              </Button>
            ) : (
              <Button
                onClick={handleApplyCoupon}
                disabled={isMutating || !couponCode.trim()}
              >
                {isMutating ? "Applying..." : "Apply"}
              </Button>
            )}
          </div>

          {appliedCoupon && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">Applied Coupon</Label>
                  <p className="text-sm text-muted-foreground">
                    {appliedCoupon}
                  </p>
                </div>
                <div className="text-right">
                  <Label className="text-sm font-medium">Discount</Label>
                  <p className="text-sm text-green-600">
                    -${discountAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
