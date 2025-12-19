"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sprout, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    id: "sponsor",
    title: "Sponsor a Tree",
    subtitle: "Plant the seed of change",
    image: "/trees/sponsor.png",
    href: "/sponsor-a-tree",
    color: "from-emerald-950/90 to-emerald-900/50",
    icon: Sprout,
  },
  {
    id: "adopt",
    title: "Adopt a Tree",
    subtitle: "Witness growth year after year",
    image: "/trees/adopt.png",
    href: "/adopt-a-tree",
    color: "from-amber-950/90 to-amber-900/50",
    icon: Heart,
  },
  {
    id: "feed",
    title: "Feed the Tree",
    subtitle: "Nurture life from the roots",
    image: "/trees/feed.png",
    href: "/feed-the-tree",
    color: "from-blue-950/90 to-blue-900/50",
    icon: Users,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <main className="relative w-full h-dvh bg-background flex flex-col overflow-hidden">
      <section className="relative z-10 flex-none px-6 py-6 md:py-10 text-center bg-linear-to-b from-background/80 to-background/20 backdrop-blur-sm border-b border-border/10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto space-y-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
            Nature grows with{" "}
            <span className="text-primary/90">your story</span>
          </h1>
          <p className="text-muted-foreground/80 font-light text-base md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Every tree begins a new chapter. Choose your path to restore the
            earth.
          </p>
        </motion.div>
      </section>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col md:flex-row w-full h-full"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="group relative flex-1 min-h-0 w-full md:h-full overflow-hidden border-b border-white/10 md:border-b-0 md:border-r last:border-0 bg-black"
          >
            <Link href={item.href} className="flex w-full h-full">
              <div className="absolute inset-0 z-0 overflow-hidden transform-gpu">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-90"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-t md:bg-linear-to-b opacity-80 transition-opacity duration-500 group-hover:opacity-75",
                    item.color
                  )}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />
              </div>

              <div className="relative z-10 w-full h-full flex flex-row md:flex-col items-center justify-between p-6 md:p-12 text-white transition-all duration-500">
                <div className="flex items-center md:items-start gap-5 md:flex-col md:gap-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 group-hover:border-white/30 transition-all">
                    <item.icon className="w-5 h-5 md:w-8 md:h-8 text-white/90" />
                  </div>

                  <div className="text-left space-y-1 md:space-y-3">
                    <h2 className="text-2xl md:text-4xl font-bold leading-none tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-white/70 font-medium text-xs md:text-lg tracking-wide uppercase opacity-0 -translate-y-2 md:opacity-100 md:translate-y-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pl-4 md:pl-0 md:mt-auto md:w-full md:flex md:justify-end">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 transform group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 md:w-7 md:h-7 -rotate-45 md:rotate-0 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
