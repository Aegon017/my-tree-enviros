"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const fogY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const treesY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const fade = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-background">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[url('/parallax/bg-mountains.png')] bg-cover bg-center opacity-60"
      />
      <motion.div
        style={{ y: fogY }}
        className="absolute inset-0 bg-[url('/parallax/mid-fog.png')] bg-cover bg-center opacity-60"
      />
      <motion.div
        style={{ y: treesY }}
        className="absolute inset-0 bg-[url('/parallax/fg-trees.png')] bg-cover bg-center opacity-90"
      />

      <div className="relative z-20 flex flex-col items-center text-center px-6 pt-40 pb-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.3em] text-sm text-muted-foreground"
        >
          My Tree Enviros
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl max-w-4xl font-semibold uppercase leading-tight text-foreground"
        >
          Nature grows with your story.
          <span className="block text-primary">
            Every tree begins a new chapter.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-4 max-w-2xl text-lg text-muted-foreground"
        >
          Walk into a living journey. Sponsor, adopt, or nourish a tree and watch the world change through your actions.
        </motion.p>
      </div>

      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 pb-40 space-y-16">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative h-[360px] overflow-hidden rounded-3xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-muted/40" />
            <div className="relative z-10 p-10 max-w-md">
              <h2 className="font-mono text-3xl font-semibold text-foreground text-left">
                Sponsor a Tree
              </h2>
              <p className="mt-3 text-muted-foreground text-left leading-relaxed">
                Sponsor a tree today and help restore nature, support green growth, and create a healthier planet.
              </p>
            </div>
            <motion.img
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              src="/trees/sponsor.png"
              className="absolute right-0 bottom-0 w-64 object-contain pointer-events-none"
            />
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative h-[360px] rounded-3xl overflow-hidden bg-muted/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20" />
            <div className="relative z-10 p-10 max-w-md">
              <h2 className="font-mono text-3xl font-semibold text-foreground text-left">
                Adopt a Tree
              </h2>
              <p className="mt-3 text-muted-foreground text-left leading-relaxed">
                Adopt a tree today and nurture nature’s growth, protect the environment, and create a greener future.
              </p>
            </div>
            <motion.img
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              src="/trees/adopt.png"
              className="absolute right-0 bottom-0 w-56 object-contain pointer-events-none"
            />
          </motion.div>
        </div>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[380px] rounded-3xl overflow-hidden bg-background/50 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-muted/40 to-muted/20" />
          <div className="relative z-10 p-10 max-w-lg">
            <h2 className="font-mono text-3xl font-semibold text-foreground text-left">
              Feed a Tree
            </h2>
            <p className="mt-3 text-muted-foreground text-left leading-relaxed max-w-md">
              Join our campaigns to restore degraded ecological zones and help rebuild nature for a healthier planet.
            </p>
          </div>
          <motion.img
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            src="/trees/feed.png"
            className="absolute right-0 bottom-0 w-72 object-contain pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
}
  