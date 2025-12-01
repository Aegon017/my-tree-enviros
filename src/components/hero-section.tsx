"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { WobbleCard } from "@/components/ui/wobble-card";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background overflow-hidden pb-40"
    >
      <motion.img
        src="/parallax/bg-mountains.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70 z-0"
        style={{ y: bgY }}
      />

      <motion.img
        src="/parallax/mid-fog.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 z-10"
        style={{ y: midY }}
      />

      <motion.img
        src="/parallax/fg-trees.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90 z-20"
        style={{ y: fgY }}
      />

      <div className="relative z-30 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-24 text-center md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          My Tree Enviros
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-4xl text-4xl font-semibold leading-tight text-foreground md:text-6xl"
        >
          Grow trees. Track impact.
          <span className="block bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
            Make the planet better.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Sponsor, adopt, and feed trees in real locations — and watch your impact grow.
        </motion.p>
      </div>

      <div className="relative z-30 mx-auto mt-20 grid w-full max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">

        <ScrollFadeIn>
          <div className="relative">
            <WobbleCard containerClassName="min-h-[340px] bg-primary/10">
              <div className="space-y-4">
                <h2 className="text-left text-2xl font-semibold text-foreground md:text-3xl">
                  Sponsor a Tree
                </h2>
                <p className="text-left text-muted-foreground">
                  Plant the first seed of change. Sponsor a new tree and enable its journey.
                </p>
              </div>
              <img
                src="/trees/sponsor.png"
                alt=""
                className="absolute bottom-0 right-0 w-40 object-contain opacity-90"
              />
            </WobbleCard>

            <Link href="/sponsor-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.15}>
          <div className="relative">
            <WobbleCard containerClassName="min-h-[340px] bg-emerald-600/20">
              <div className="space-y-4">
                <h2 className="text-left text-2xl font-semibold text-foreground md:text-3xl">
                  Adopt a Tree
                </h2>
                <p className="text-left text-muted-foreground">
                  Follow your tree’s growth with real-time photos, updates, and metrics.
                </p>
              </div>
              <img
                src="/trees/adopt.png"
                alt=""
                className="absolute bottom-0 right-0 w-40 object-contain opacity-90"
              />
            </WobbleCard>

            <Link href="/adopt-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.3}>
          <div className="relative">
            <WobbleCard containerClassName="min-h-[340px] bg-green-800/20">
              <div className="space-y-4">
                <h2 className="text-left text-2xl font-semibold text-foreground md:text-3xl">
                  Feed & Nurture
                </h2>
                <p className="text-left text-muted-foreground">
                  Support regular care — watering, nutrients, and protection.
                </p>
              </div>
              <img
                src="/trees/feed.png"
                alt=""
                className="absolute bottom-0 right-0 w-44 object-contain opacity-90"
              />
            </WobbleCard>

            <Link href="/feed-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>

      </div>
    </section>
  );
}

function ScrollFadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-80px" }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}