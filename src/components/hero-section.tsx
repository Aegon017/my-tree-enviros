"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-neutral-200 dark:bg-neutral-800 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-semibold tracking-tight mb-6"
        >
          Grow a Greener Future
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
        >
          Support nature’s recovery through simple, meaningful actions— sponsor,
          adopt, or feed a tree.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" className="rounded-full px-6">
            Sponsor a Tree
          </Button>

          <Button variant="outline" size="lg" className="rounded-full px-6">
            Adopt a Tree
          </Button>

          <Button variant="outline" size="lg" className="rounded-full px-6">
            Feed a Tree
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
