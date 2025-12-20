"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sprout, Heart, Users } from "lucide-react";
import Image from "next/image";

const items = [
  {
    id: "sponsor",
    title: "Sponsor a Tree",
    subtitle: "Plant the seed of change",
    href: "/sponsor-a-tree",
    icon: Sprout,
    image: "/images/trees/sponsor.png",
  },
  {
    id: "adopt",
    title: "Adopt a Tree",
    subtitle: "Witness growth year after year",
    href: "/adopt-a-tree",
    icon: Heart,
    image: "/images/trees/adopt.png",
  },
  {
    id: "feed",
    title: "Feed the Tree",
    subtitle: "Nurture life from the roots",
    href: "/feed-the-tree",
    icon: Users,
    image: "/images/trees/feed.png",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <main className="relative w-full bg-background text-foreground">
      {/* Hero */}
      <section className="px-6 py-8 md:py-16 text-center border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto space-y-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary">
            Nature grows with your story
          </h1>
          <p className="text-muted-foreground text-base md:text-2xl leading-relaxed">
            Every tree begins a new chapter. Choose your path to restore the
            earth.
          </p>
        </motion.div>
      </section>

      {/* Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border"
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={itemVariants} className="group relative">
            <Link
              href={item.href}
              className="flex flex-col gap-6 px-6 py-8 md:px-12 md:py-14 transition-colors duration-300 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight">
                  {item.title}
                </h2>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">
                  {item.subtitle}
                </p>
              </div>
            </Link>
            <div className="absolute bottom-0 right-0">
              <Image
                src={item.image}
                alt={item.title}
                width={110}
                height={100}
                className="object-cover"
              />
            </div>
          </motion.div>
        ))}
      </motion.section>
    </main>
  );
}
