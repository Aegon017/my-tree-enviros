"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-24 text-center md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs tracking-[0.25em] text-muted-foreground uppercase"
        >
          My Tree Enviros
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Sponsor, adopt, and feed trees in real locations — and watch your environmental impact grow in your personal dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <button className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            Get Started
          </button>

          <button className="rounded-lg border border-border bg-muted px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/80">
            Learn More
          </button>
        </motion.div>
      </div>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.10),_transparent_70%)]" />
    </section>
  );
}
