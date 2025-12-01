"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import Link from "next/link";
import { WobbleCard } from "@/components/ui/wobble-card";

interface ScrollFadeInProps {
  children: ReactNode;
  delay?: number;
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const layer1 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const layer2 = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const layer3 = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-background pb-44"
    >
      <motion.img
        src="/parallax/bg-mountains.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        style={{ y: layer1 }}
      />

      <motion.img
        src="/parallax/mid-fog.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        style={{ y: layer2 }}
      />

      <motion.img
        src="/parallax/fg-trees.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        style={{ y: layer3 }}
      />

      <div className="relative z-30 mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-28 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          My Tree Enviros
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="uppercase max-w-4xl text-4xl font-semibold leading-tight text-foreground md:text-6xl"
        >
          Nature grows with your story.
          <span className="block text-primary">
            Every tree begins a new chapter.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Walk into a living journey. Sponsor, adopt, or nourish a tree and watch the world change through your actions.
        </motion.p>
      </div>

      <div className="relative z-30 mx-auto mt-24 grid w-full max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <ScrollFadeIn>
          <div className="relative">
            <WobbleCard containerClassName="min-h-58 bg-muted/10 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <h2 className="uppercase text-left text-2xl font-semibold text-primary md:text-3xl">
                  Sponsor a Tree
                </h2>
                <p className="text-left text-muted-foreground">
                  Begin the story of a new life. Your support plants hope in the earth.
                </p>
              </div>
              <img
                src="/trees/sponsor.png"
                alt=""
                className="absolute -bottom-20 -right-8 w-48 opacity-100 object-contain"
              />
            </WobbleCard>
            <Link href="/sponsor-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.15}>
          <div className="relative">
            <WobbleCard containerClassName="min-h-58 bg-muted/15 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <h2 className="uppercase text-primary text-left text-2xl font-semibold md:text-3xl">
                  Adopt a Tree
                </h2>
                <p className="text-left text-muted-foreground">
                  Witness growth in real time. Photos, updates, and life unfolding before you.
                </p>
              </div>
              <img
                src="/trees/adopt.png"
                alt=""
                className="absolute -bottom-20 -right-8 w-48 opacity-100 object-contain"
              />
            </WobbleCard>
            <Link href="/adopt-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.3}>
          <div className="relative">
            <WobbleCard containerClassName="min-h-58 bg-muted/20 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="space-y-4">
                <h2 className="uppercase text-left text-2xl font-semibold text-primary md:text-3xl">
                  Feed a Tree
                </h2>
                <p className="text-left text-muted-foreground">
                  Support ongoing care—water, nutrients, and protection to keep life thriving.
                </p>
              </div>
              <img
                src="/trees/feed.png"
                alt=""
                className="absolute -bottom-20 -right-10 w-52 opacity-100 object-contain"
              />
            </WobbleCard>
            <Link href="/feed-a-tree" className="absolute inset-0 z-50" />
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}

function ScrollFadeIn({ children, delay = 0 }: ScrollFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-120px" }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
