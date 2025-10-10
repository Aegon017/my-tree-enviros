"use client";

import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
