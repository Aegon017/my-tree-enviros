import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import Footer from "@/components/app-footer";
import Header from "@/components/app-header";

export const metadata: Metadata = {
  title: "My Tree Enviros",
  description:
    "From vibrant flowering plants to lush tropical greens, we offer an incredible variety to turn your space into a living paradise.",
};

import FcmManager from "@/components/fcm-manager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="razorpay-checkout-script"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>

      <body>
        <NextTopLoader color="#715130" showSpinner={false} />
        <FcmManager />
        <Header />
        {children}
        <Footer />
        <Toaster richColors position="top-center" closeButton={true} />
      </body>
    </html>
  );
}
