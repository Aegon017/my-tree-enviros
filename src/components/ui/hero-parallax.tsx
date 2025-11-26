"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

type Product = {
  title: string;
  description: string;
  image: string;
  actionLabel: string;
  actionLink: string;
  ctaLabel: string;
  ctaLink: string;
};

export const HeroParallax = ({ products }: { products: Product[] }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );

  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );

  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />

      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <Row products={firstRow} translate={translateX} reverse />
        <Row products={secondRow} translate={translateXReverse} />
        <Row products={thirdRow} translate={translateX} reverse />
      </motion.div>
    </div>
  );
};

const Row = ({
  products,
  translate,
  reverse = false,
}: {
  products: Product[];
  translate: MotionValue<number>;
  reverse?: boolean;
}) => {
  return (
    <motion.div
      style={{ x: translate }}
      className={`flex ${reverse ? "flex-row-reverse space-x-reverse" : ""
        } space-x-20 mb-20`}
    >
      {products.map((product, i) => (
        <ProductCard key={i} product={product} />
      ))}
    </motion.div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <CardContainer className="inter-var w-[26rem]">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/20 border-black/10 w-full rounded-xl p-6 border">
        <CardItem translateZ="50" className="text-xl font-bold">
          {product.title}
        </CardItem>

        <CardItem translateZ="60" as="p" className="text-sm max-w-sm mt-2">
          {product.description}
        </CardItem>

        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src={product.image}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={product.title}
          />
        </CardItem>

        <div className="flex justify-between items-center mt-20">
          <CardItem
            translateZ={20}
            as="a"
            href={product.actionLink}
            className="px-4 py-2 rounded-xl text-xs font-normal"
          >
            {product.actionLabel} →
          </CardItem>

          <CardItem
            translateZ={20}
            as="a"
            href={product.ctaLink}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
            {product.ctaLabel}
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl md:text-7xl uppercase font-bold text-primary">
        Grow a Greener <br /> Future, One Tree at a Time
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-secondary">
        Sponsor, adopt, or feed a tree and make a lasting positive impact on 
        nature. Join us in restoring ecosystems, nurturing saplings, and 
        supporting climate action—starting right where you are.
      </p>
    </div>
  );
};
