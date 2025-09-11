"use client";

import { motion } from "motion/react";

interface Props {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

const alignmentClasses = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const SectionTitle: React.FC<Props> = ({
  title,
  subtitle,
  align = "center",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className={`flex flex-col gap-2 mb-10 ${alignmentClasses[align]}`}
    >
      <h2 className="text-3xl font-bold tracking-tight relative">
        <span className="uppercase bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {title}
        </span>
        <span className="block w-16 h-1 mt-2 bg-primary mx-auto rounded-full" />
      </h2>

      {subtitle && <p className="text-muted-foreground text-md">{subtitle}</p>}
    </motion.div>
  );
};

export default SectionTitle;
