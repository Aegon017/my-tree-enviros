"use client";

import Image from "next/image";
import Link from "next/link";

export default function AppDownloadSection() {
  return (
    <section className="w-full bg-background flex justify-center py-24 px-4">
      <div
        className="
          w-full max-w-6xl
          rounded-2xl
          border border-border/30
          bg-background
          p-8
          shadow-sm
          flex flex-col md:flex-row items-center justify-between
          gap-20
        "
      >
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Download the app now
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
            Experience smoother ordering and a greener journey with the MyTree
            mobile app.
          </p>

          <div className="flex items-center gap-6">
            <Link href="https://play.google.com" target="_blank">
              <div className="relative w-full max-w-[190px] h-auto">
                <Image
                  src="/google-play-badge.avif"
                  alt="Google Play"
                  width={0}
                  height={0}
                  className="w-full h-auto transition-opacity hover:opacity-80"
                />
              </div>
            </Link>

            <Link href="https://apple.com/app-store" target="_blank">
              <div className="relative w-full max-w-[190px] h-auto">
                <Image
                  src="/app-store-badge.avif"
                  alt="App Store"
                  width={0}
                  height={0}
                  className="w-full h-auto transition-opacity hover:opacity-80"
                />
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="
              rounded-2xl
              border border-border/40
              bg-background
              shadow-md
            "
          >
            <Image
              src="/qr.svg"
              alt="QR Code"
              width={210}
              height={210}
              className="rounded-xl"
            />
          </div>

          <p className="mt-5 text-sm text-muted-foreground tracking-wide text-center">
            Scan to download the app
          </p>
        </div>
      </div>
    </section>
  );
}
