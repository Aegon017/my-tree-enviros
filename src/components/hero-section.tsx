"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import Link from "next/link";

const chapters = [
  {
    id: "sponsor",
    number: "01",
    chapter: "Chapter I",
    label: "The First Light",
    title: "Sponsor a Tree",
    subtitle: "Every forest begins with a single promise.",
    body: "Your contribution becomes the first spark that breaks the dark. Plant hope, nurture life, and watch as a single seed transforms into a legacy of green.",
    image: "/trees/sponsor.png",
    href: "/sponsor-a-tree"
  },
  {
    id: "adopt",
    number: "02",
    chapter: "Chapter II",
    label: "The Growing Bond",
    title: "Adopt a Tree",
    subtitle: "Growth is not a moment.",
    body: "Adoption is staying as the rings grow year by year. Build a lasting connection with nature and witness the journey of life unfold before your eyes.",
    image: "/trees/adopt.png",
    href: "/adopt-a-tree"
  },
  {
    id: "feed",
    number: "03",
    chapter: "Chapter III",
    label: "The Living Legacy",
    title: "Feed a Tree",
    subtitle: "Nourish one and you nourish many.",
    body: "Feeding brings harmony to the entire ecosystem. Join our campaigns to restore degraded zones and help rebuild nature for a healthier planet.",
    image: "/trees/feed.png",
    href: "/feed-a-tree"
  }
];

export default function HeroSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const layer1 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const layer2 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const layer3 = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <main ref={containerRef} className="relative w-full text-foreground overflow-hidden">

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

      <section className="relative z-30 min-h-screen flex flex-col items-center justify-center pb-36">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-5xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="uppercase tracking-[0.3em] text-xs text-primary/80 mb-6"
          >
            My Tree Enviros
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-6xl md:text-8xl font-bold text-foreground mb-6 leading-[1.1]"
            style={{
              textShadow: "0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.2)"
            }}
          >
            Nature grows with your story
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-3xl md:text-5xl text-primary font-semibold mb-8"
          >
            Every tree begins a new chapter
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Walk into a living journey. Sponsor, adopt, or nourish a tree and watch the world change through your actions.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-primary/60"
          >
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-30">
        {chapters.map((chapter, index) => {
          const isReversed = index % 2 === 1;

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="relative py-16 last:mb-0 bg-background/50 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.2, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[16rem] font-bold text-primary pointer-events-none z-0"
              >
                {chapter.number}
              </motion.div>

              <div className={`relative z-10 max-w-7xl mx-auto px-6 flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}>

                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex-1 relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: isReversed ? -2 : 2 }}
                    transition={{ duration: 0.4 }}
                    className="relative aspect-square max-w-lg mx-auto"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl blur-2xl" />

                    <div className="relative backdrop-blur-sm border-2 border-primary rounded-3xl shadow-2xl">
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isReversed ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex-1 space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-primary" />
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em]">
                      <span className="text-primary font-semibold text-shadow-xs">{chapter.chapter}</span>
                      <span className="text-secondary text-shadow-xs">{chapter.label}</span>
                    </div>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-4xl text-shadow-xs md:text-6xl font-bold text-foreground leading-tight"
                  >
                    {chapter.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-xl text-shadow-xs md:text-2xl text-primary font-medium"
                  >
                    {chapter.subtitle}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-base text-shadow-xs md:text-lg text-secondary leading-relaxed max-w-xl"
                  >
                    {chapter.body}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Link href={chapter.href}>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg overflow-hidden shadow-lg"
                      >
                        <span className="relative z-10">Begin Your Journey</span>
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-primary to-primary/80"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {index < chapters.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="max-w-xs mx-auto mt-32 h-px bg-linear-to-r from-transparent via-border to-transparent"
                />
              )}
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}
