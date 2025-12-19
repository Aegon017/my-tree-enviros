"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const chapters = [
  {
    id: "sponsor",
    title: "Sponsor a Tree",
    subtitle: "Plant the seed of change",
    body: "Your contribution becomes the spark that restores forests and builds a future rooted in life.",
    image: "/trees/sponsor.png",
    href: "/sponsor-a-tree",
    accent: "from-emerald-400 to-green-600",
  },
  {
    id: "adopt",
    title: "Adopt a Tree",
    subtitle: "Witness growth year after year",
    body: "Follow the living journey of a tree and grow alongside nature over time.",
    image: "/trees/adopt.png",
    href: "/adopt-a-tree",
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "alliance",
    title: "The Green Alliance",
    subtitle: "Nurture ecosystems together",
    body: "Join a collective effort that regenerates land and builds resilient ecosystems.",
    image: "/trees/feed.png",
    href: "/the-green-alliance",
    accent: "from-sky-400 to-blue-600",
  },
];

export default function HeroExperience() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: trackRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <main className="relative w-full bg-background overflow-hidden">
      <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary"
        >
          A living journey begins
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-2xl text-muted-foreground text-lg md:text-xl"
        >
          Choose how you connect with nature — sponsor, adopt, or regenerate ecosystems.
        </motion.p>
      </section>

      <section className="md:hidden">
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
          {chapters.map((item) => (
            <div
              key={item.id}
              className="snap-start min-h-screen flex items-center justify-center px-6"
            >
              <div className="w-full max-w-sm rounded-3xl bg-background border border-border/40 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${item.accent}`} />
                <div className="p-6">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-primary text-sm font-medium mt-1">
                    {item.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center mt-6 text-primary font-semibold text-sm"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={trackRef}
        className="hidden md:block relative h-[300vh]"
      >
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex w-[300vw]"
          >
            {chapters.map((item) => (
              <div
                key={item.id}
                className="w-screen h-screen flex items-center justify-center px-24"
              >
                <div className="grid grid-cols-2 gap-16 items-center max-w-6xl">
                  <div>
                    <h2 className="text-5xl font-bold text-primary">
                      {item.title}
                    </h2>
                    <p className="text-primary/80 text-lg mt-2">
                      {item.subtitle}
                    </p>
                    <p className="text-muted-foreground text-lg mt-6 max-w-md">
                      {item.body}
                    </p>
                    <Link
                      href={item.href}
                      className="inline-flex items-center mt-8 text-primary font-semibold"
                    >
                      Begin this chapter
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Link>
                  </div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}