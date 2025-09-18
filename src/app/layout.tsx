import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";

const geistSans = Geist( {
  variable: "--font-geist-sans",
  subsets: [ "latin" ],
} );

const geistMono = Geist_Mono( {
  variable: "--font-geist-mono",
  subsets: [ "latin" ],
} );

export const metadata: Metadata = {
  title: "My Tree Enviros",
  description:
    "From vibrant flowering plants to lush tropical greens, we offer an incredible variety to turn your space into a living paradise.",
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="en">
      <body
        className={ `${ geistSans.variable } ${ geistMono.variable } antialiased` }
      >
        <NextTopLoader color="#715130" showSpinner={ false} />
        { children }
        <Toaster richColors position="top-right" closeButton={ true } />
      </body>
    </html>
  );
}
