"use client";

import { Home, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailurePage />
    </Suspense>
  );
}

function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error") || "Payment processing failed";
  const amount = parseFloat(searchParams.get("amount") || "0");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Failure Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Failure Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground">
            We couldn't process your payment. Please try again.
          </p>
        </div>

        {/* Error Alert */}
        <Alert
          variant="destructive"
          className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        >
          <AlertDescription className="text-red-800 dark:text-red-300">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {/* Order Details Card */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">
              Payment Summary
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your payment was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium text-foreground">
                ₹{amount.toFixed(2)}
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Possible reasons for failure:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Insufficient funds</li>
                <li>Bank server timeout</li>
                <li>Invalid card details</li>
                <li>Network issues</li>
              </ul>
            </div>

            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            >
              Payment Failed
            </Badge>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-primary text-primary-foreground">
            <Link href="/checkout">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
