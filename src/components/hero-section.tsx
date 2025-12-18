"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

const layers = [
  { src: "/parallax/bg-layer1.png", yEnd: "10%", opacity: "35%" },
  { src: "/parallax/bg-layer2.png", yEnd: "20%", opacity: "45%" },
  { src: "/parallax/bg-layer3.png", yEnd: "30%", opacity: "55%" },
];

const chapters = [
  {
    id: "sponsor",
    title: "Sponsor a Tree",
    subtitle: "Plant the seed of change",
    body: "Your contribution becomes the first spark that breaks the dark. Plant hope, nurture life, and watch as a single seed transforms into a legacy of green.",
    image: "/trees/sponsor.png",
    href: "/sponsor-a-tree",
    color: "bg-emerald-500/10",
    hoverColor: "group-hover:bg-emerald-500/20",
  },
  {
    id: "adopt",
    title: "Adopt a Tree",
    subtitle: "Witness growth year after year",
    body: "Adoption is staying as the rings grow year by year. Build a lasting connection with nature and witness the journey of life unfold before your eyes.",
    image: "/trees/adopt.png",
    href: "/adopt-a-tree",
    color: "bg-amber-500/10",
    hoverColor: "group-hover:bg-amber-500/20",
  },
  {
    id: "feed",
    title: "The Green Alliance",
    subtitle: "Nurture ecosystems from within",
    body: "The Green Alliance is a collective action platform where members finance to take part and learn specific land rejuvenation efforts.",
    image: "/trees/feed.png",
    href: "/the-green-alliance",
    color: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
  },
];

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.5], ["0%", "60%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <main ref={ref} className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {layers.map((layer, i) => {
          const y = useTransform(scrollYProgress, [0, 1], ["0%", layer.yEnd]);
          return (
            <motion.div key={i} style={{ y }} className="absolute inset-0">
              <Image
                src={layer.src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover"
                style={{ opacity: layer.opacity }}
              />
            </motion.div>
          );
        })}
        <div className="absolute inset-0 bg-linear-to-b from-background/10 via-background/40 to-background" />
      </div>

      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6 pb-32">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary"
          >
            Nature grows with your story
            <span className="block text-2xl md:text-4xl lg:text-5xl font-light text-foreground mt-2">
              Every tree begins a new chapter
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Walk into a living journey. Sponsor, adopt, or nourish a tree and
            watch the world change through your actions.
          </motion.p>
        </motion.div>
      </section>

      {/* Parallax Transition */}
      <section className="relative z-20 px-6 -mt-32 md:-mt-40 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {chapters.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
            >
              <Link href={item.href} className="group block">
                <div
                  className={`relative p-8 rounded-3xl border border-border/40 bg-background/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${item.color} ${item.hoverColor}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6 w-full aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden shadow group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-3">
                      {item.subtitle}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                      {item.body}
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm">
                      {item.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
