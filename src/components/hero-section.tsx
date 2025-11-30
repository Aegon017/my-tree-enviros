"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CinematicScrollHero() {
  return (
    <section className="relative h-[90vh] bg-black text-white md:h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/aerial-shot-road-middle-forest-day.jpg"
          alt="Lush forest landscape"
          fill
          priority
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <h1 className="text-center text-4xl font-semibold tracking-[0.35em] md:text-5xl lg:text-6xl uppercase">
          MY TREE ENVIROS
        </h1>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 px-6">
        <div className="mx-auto flex max-w-6xl items-end justify-between text-[11px] uppercase tracking-[0.18em] text-white/70">
          <div className="pointer-events-auto flex flex-col gap-2">
            <span className="text-white/60">Sponsor • Adopt • Feed a Tree</span>
            <div className="flex flex-wrap gap-3 text-[10px] text-white/55">
              <Link href="/sponsor-a-tree" className="hover:text-white">
                Sponsor a Tree
              </Link>
              <Link href="/adopt-a-tree" className="hover:text-white">
                Adopt a Tree
              </Link>
              <Link href="/feed-a-tree" className="hover:text-white">
                Feed a Tree
              </Link>
            </div>
          </div>

          <div className="pointer-events-auto hidden items-center gap-3 md:flex">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              My Tree Enviros
            </span>
            <span className="text-[11px] text-white/60">
              A slower, more intentional way to care for the planet
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
        <span>Scroll down</span>
        <div className="h-8 w-px bg-white/60" />
      </div>

      <div className="pointer-events-none absolute left-6 top-6 text-[11px] uppercase tracking-[0.2em] text-white/70">
        <span className="hidden sm:inline">Tree Stewardship Studio</span>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-white/70">
        <Link href="/" className="pointer-events-auto hover:text-white">
          Home
        </Link>
        <Link
          href="/sponsor-a-tree"
          className="pointer-events-auto hover:text-white"
        >
          Sponsor
        </Link>
        <Link
          href="/store"
          className="pointer-events-auto hover:text-white"
        >
          Store
        </Link>
      </div>
    </section>
  );
}
