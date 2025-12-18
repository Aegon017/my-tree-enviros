import React from "react";
import { Separator } from "@/components/ui/separator";

interface OrderCharge {
  type: "tax" | "shipping" | "fee";
  label: string;
  amount: number;
}

interface PricingSummaryProps {
  subtotal: number;
  discount?: number;
  tax: number;
  shipping: number;
  fee: number;
  total: number;
  charges?: OrderCharge[];
  className?: string;
}

export function PricingSummary({
  subtotal,
  discount = 0,
  tax,
  shipping,
  fee,
  total,
  charges = [],
  className = "",
}: PricingSummaryProps) {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-green-600">
            -{formatCurrency(discount)}
          </span>
        </div>
      )}

      {/* Detailed Charges */}
      {charges.length > 0 ? (
        charges.map((charge, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{charge.label}</span>
            <span className="font-medium">{formatCurrency(charge.amount)}</span>
          </div>
        ))
      ) : (
        <>
          {/* Fallback to aggregated charges if detailed charges not available */}
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
          )}
          {shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{formatCurrency(shipping)}</span>
            </div>
          )}
          {fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-medium">{formatCurrency(fee)}</span>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Total */}
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
