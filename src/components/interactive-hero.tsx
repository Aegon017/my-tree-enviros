"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    useScroll,
    useSpring,
} from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slider {
    id: number;
    title: string;
    description?: string;
    main_image_url: string;
    button_text?: string;
    button_link?: string;
}

const FilmGrain = () => (
    <motion.div
        className="absolute inset-0 pointer-events-none z-6 opacity-[0.08] mix-blend-overlay"
        style={{
            backgroundImage: "linear-gradient(transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
            backgroundSize: "3px 3px",
        }}
    />
);

const TextRevealVertical = ({ text, className = "" }: { text: string; className?: string }) => {
    const words = useMemo(() => text.split(" "), [text]);

    return (
        <div className={`inline-block overflow-hidden ${className}`}>
            <div className="flex flex-wrap justify-center gap-3">
                {words.map((word, wIndex) => (
                    <div key={wIndex} className="inline-flex">
                        {word.split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                className="inline-block"
                                initial={{ y: "120%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                transition={{ duration: 0.6, delay: (wIndex * 0.2) + i * 0.04 }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};


const MagneticButton = ({
    children,
    className,
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const xs = useSpring(x, { stiffness: 160, damping: 20 });
    const ys = useSpring(y, { stiffness: 160, damping: 20 });

    const handleMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.12);
        y.set((e.clientY - centerY) * 0.12);
    }, [x, y]);

    const handleReset = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleReset}
            style={{ x: xs, y: ys }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};

export default function InteractiveHero({ sliders = [] }: { sliders: Slider[]; loading?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    const { scrollYProgress } = useScroll(
        isReady
            ? { target: containerRef, offset: ["start start", "end start"] }
            : undefined
    );

    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.94]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.5], [0, 24]);
    const translateY = useTransform(scrollYProgress, [0, 0.5], [0, 48]);
    const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const totalSlides = sliders.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    useEffect(() => {
        if (!isAutoPlaying || totalSlides === 0) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, totalSlides, nextSlide]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
        setIsAutoPlaying(false);
    }, [mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsAutoPlaying(true);
    }, [mouseX, mouseY]);

    const currentSlide = sliders[currentIndex];

    if (!isMounted) {
        return (
            <div className="h-[calc(100dvh-240px)] bg-black flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!currentSlide) {
        return (
            <div className="h-[calc(100dvh-240px)] bg-black flex items-center justify-center">
                <div className="text-muted-foreground">No slides available</div>
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className="relative h-[calc(100dvh-240px)] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="relative h-[200vh]">
                <div className="sticky top-0 h-[calc(100dvh-240px)] overflow-hidden flex items-center justify-center">
                    <motion.div
                        style={{ scale, borderRadius, y: translateY, opacity: fade }}
                        className="relative w-full h-full overflow-hidden bg-black"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <FilmGrain />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 1.06 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={currentSlide.main_image_url}
                                    alt={currentSlide.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="100vw"
                                />
                                <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/90" />
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-8 md:p-16">
                            <motion.div style={{ y: textY, opacity: fade }} className="max-w-5xl space-y-8">
                                <TextRevealVertical
                                    text={currentSlide.title}
                                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-2xl"
                                />

                                {currentSlide.description && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.45 }}
                                        className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
                                    >
                                        {currentSlide.description}
                                    </motion.p>
                                )}

                                {currentSlide.button_text && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="pt-8"
                                    >
                                        <MagneticButton
                                            className="group relative inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-black transition-all hover:bg-white/95 hover:scale-105"
                                            onClick={() => currentSlide.button_link && (window.location.href = currentSlide.button_link)}
                                        >
                                            {currentSlide.button_text}
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </MagneticButton>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        <div className="absolute bottom-10 right-10 z-30 gap-4 hidden md:flex">
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={prevSlide}
                                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={nextSlide}
                                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
                            {sliders.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300 hover:bg-white/80",
                                        idx === currentIndex ? "w-12 bg-white" : "w-3 bg-white/30"
                                    )}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
