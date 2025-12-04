"use client";

import { CheckCircle2, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ordersService } from "@/modules/orders/services/orders.service";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}

function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (orderId) {
      const id = Number(orderId);
      if (!Number.isNaN(id) && id > 0) {
        ordersService
          .getOrderById(id)
          .then((res) => {
            const orderData = res?.data;
            if (mounted && orderData) {
              setOrder(orderData);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (mounted) setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  const treeItem = order?.items?.[0];
  const formattedAmount = `₹${Number(order?.grand_total || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your contribution. Your payment has been processed.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Order Details</CardTitle>
            <CardDescription>Your order has been confirmed</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground">Order Number</p>
                <p className="font-medium">{order?.reference_number}</p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="font-medium">{formattedAmount}</p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{order?.status}</p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {order?.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">
                {order?.payment?.method || "Razorpay"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-medium">
                {order?.payment?.transaction_id || "N/A"}
              </p>
            </div>

            {treeItem && (
              <>
                <Separator />

                <div className="space-y-1">
                  <p className="text-muted-foreground">Tree Sponsored</p>
                  <p className="font-medium">{treeItem.tree_name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{treeItem.quantity}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">Tree Amount</p>
                  <p className="font-medium">
                    ₹{Number(treeItem.amount).toFixed(2)}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Payment Completed
            </Badge>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Button asChild className="flex-1">
            <Link href="/my-orders">
              View Orders
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}