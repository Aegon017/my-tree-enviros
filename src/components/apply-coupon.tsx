"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ordersService } from "@/modules/orders/services/orders.service";

interface ApplyCouponProps {
  onCouponApplied: (discount: number, couponId: number, code: string) => void;
  onCouponRemoved: () => void;
  currentTotal: number;
  disabled?: boolean;
}

export function ApplyCoupon({
  onCouponApplied,
  onCouponRemoved,
  currentTotal,
  disabled,
}: ApplyCouponProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    try {
      const response = await ordersService.validateCoupon(
        couponCode,
        currentTotal,
      );
      if (response.success && response.data) {
        setIsApplied(true);
        onCouponApplied(response.data.discount, response.data.coupon_id, couponCode);
        toast.success("Coupon applied successfully");
      } else {
        toast.error(response.message || "Invalid coupon");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setIsApplied(false);
    onCouponRemoved();
    toast.info("Coupon removed");
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
              placeholder="ENTER COUPON CODE"
              value={couponCode.toUpperCase()}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={disabled || isApplied || loading}
            />
            {isApplied ? (
              <Button
                onClick={handleRemoveCoupon}
                disabled={disabled || loading}
                variant="outline"
              >
                REMOVE
              </Button>
            ) : (
              <Button
                onClick={handleApplyCoupon}
                disabled={disabled || !couponCode.trim() || loading}
              >
                {loading ? "APPLYING..." : "APPLY"}
              </Button>
            )}
          </div>

          {isApplied && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">Applied Coupon</Label>
                  <p className="text-sm text-muted-foreground">{couponCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Discount applied
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
