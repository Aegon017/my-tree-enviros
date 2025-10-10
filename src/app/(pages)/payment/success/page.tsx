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

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={ <div>Loading...</div> }>
      <PaymentSuccessPage />
    </Suspense>
  );
}

function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get( "order_id" ) || "N/A";
  const transactionId = searchParams.get( "transaction_id" ) || "N/A";
  const amount = parseFloat( searchParams.get( "amount" ) || "0" );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Success Icon */ }
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Success Message */ }
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your payment has been processed
            successfully.
          </p>
        </div>

        {/* Order Details Card */ }
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">
              Order Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your order has been confirmed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* <div className="space-y-1">
                                    <p className="text-muted-foreground">Order ID</p>
                                    <p className="font-medium text-foreground">{ orderId }</p>
                                </div> */}
              <div className="space-y-1">
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-medium text-foreground">{ transactionId }</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="font-medium text-foreground">
                  ₹{ amount.toFixed( 2 ) }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  { new Date().toLocaleDateString() }
                </p>
              </div>
            </div>

            <Separator className="bg-border" />

            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              Payment Completed
            </Badge>
          </CardContent>
        </Card>

        {/* Action Buttons */ }
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-primary text-primary-foreground">
            <Link href="/orders">
              View Orders
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
