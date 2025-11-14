"use client";

import type React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
  variant?: "default" | "elegant" | "minimal";
}

const alignmentClasses = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const SectionTitle: React.FC<Props> = ( {
  title,
  subtitle,
  align = "center",
  className,
  variant = "elegant",
} ) => {
  const getVariantStyles = () => {
    switch ( variant ) {
      case "elegant":
        return {
          container: "relative",
          titleWrapper: "relative",
          title:
            "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight",
          titleGradient:
            "bg-gradient-to-br from-primary via-primary to-secondary bg-clip-text text-transparent",
          decorativeElement:
            "absolute -top-2 -left-2 w-8 h-8 bg-secondary/10 rounded-full blur-sm",
          underline:
            "w-24 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-sm",
          subtitle:
            "text-base md:text-lg text-muted-foreground max-w-5xl text-pretty leading-relaxed mt-4",
        };
      case "minimal":
        return {
          container: "",
          titleWrapper: "",
          title:
            "text-2xl md:text-3xl font-semibold tracking-tight text-balance",
          titleGradient: "text-foreground",
          decorativeElement: "hidden",
          underline: "w-12 h-px bg-primary/60 rounded-full",
          subtitle:
            "text-base text-muted-foreground max-w-2xl text-pretty mt-2",
        };
      default:
        return {
          container: "",
          titleWrapper: "",
          title: "text-3xl md:text-4xl font-bold tracking-tight text-balance",
          titleGradient:
            "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent",
          decorativeElement: "hidden",
          underline: "w-16 h-1 bg-primary rounded-full",
          subtitle: "text-lg text-muted-foreground max-w-2xl text-pretty mt-3",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={ { opacity: 0, y: 30 } }
      whileInView={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.8, ease: [ 0.25, 0.46, 0.45, 0.94 ] } }
      viewport={ { once: true, margin: "-50px" } }
      className={ cn(
        "flex flex-col gap-4 mb-4",
        alignmentClasses[ align ],
        styles.container,
        className,
      ) }
    >
      <div className="space-y-3">
        <div className={ styles.titleWrapper }>
          <div className={ styles.decorativeElement } />
          <h2 className={ styles.title }>
            <span className={ styles.titleGradient }>{ title }</span>
          </h2>
        </div>

        <div
          className={ cn(
            styles.underline,
            "transition-all duration-300 ease-out",
            align === "center" && "mx-auto",
            align === "right" && "ml-auto",
          ) }
        />
      </div>

      { subtitle !== undefined && (
        <motion.p
          initial={ { opacity: 0 } }
          whileInView={ { opacity: 1 } }
          transition={ { duration: 0.6, delay: 0.2 } }
          viewport={ { once: true } }
          className={ styles.subtitle }
        >
          { subtitle }
        </motion.p>
      ) }
    </motion.div>
  );
};

export default SectionTitle;
