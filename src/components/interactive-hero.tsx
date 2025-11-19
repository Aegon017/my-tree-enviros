"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    PanInfo,
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

interface InteractiveHeroProps {
    sliders: Slider[];
    loading?: boolean;
}

// --- Helper Component: Kinetic Text Reveal ---
const AnimatedText = ({
    text,
    className,
    delay = 0,
}: {
    text: string;
    className?: string;
    delay?: number;
}) => {
    // Split text into words
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: delay * i },
        }),
    };

    const child = {
        visible: {
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            y: "100%",
        },
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {words.map((word, index) => (
                <div
                    key={index}
                    style={{ overflow: "hidden", display: "inline-block" }}
                    className="mr-[0.25em] pb-1" // Padding bottom to prevent clipping descenders
                >
                    <motion.span
                        variants={child}
                        style={{ display: "inline-block" }}
                        className="origin-bottom-left"
                    >
                        {word}
                    </motion.span>
                </div>
            ))}
        </motion.div>
    );
};

// --- Helper Component: Magnetic Button ---
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

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } =
            ref.current?.getBoundingClientRect() || {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
            };
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) * 0.2); // Magnetic pull strength
        y.set((clientY - centerY) * 0.2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseXSpring, y: mouseYSpring }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

export default function InteractiveHero({
    sliders,
    loading,
}: InteractiveHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Scroll-linked animations
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]); // Less shrinkage for grander feel
    const borderRadius = useTransform(scrollYProgress, [0, 0.5], [0, 24]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 40]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, -80]); // Stronger parallax for text

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Mouse tracking for 3D tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]); // Very subtle tilt
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const glareBackground = useTransform(
        [glareX, glareY],
        ([x, y]) =>
            `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.2), transparent 60%)`
    );

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mX = event.clientX - rect.left;
        const mY = event.clientY - rect.top;
        const xPct = mX / width - 0.5;
        const yPct = mY / height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsAutoPlaying(true);
    };

    // Auto-play logic
    useEffect(() => {
        if (!isAutoPlaying || loading || sliders.length === 0 || isDragging) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % sliders.length);
        }, 7000); // Slower for editorial feel

        return () => clearInterval(timer);
    }, [isAutoPlaying, loading, sliders.length, isDragging]);

    const handleDragEnd = (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        setIsDragging(false);
        const threshold = 50;
        if (info.offset.x < -threshold) {
            nextSlide();
        } else if (info.offset.x > threshold) {
            prevSlide();
        }
    };

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, [sliders.length]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
    }, [sliders.length]);

    // Entrance animation state
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Trigger entrance animation after a delay to coordinate with header
        const timer = setTimeout(() => {
            setMounted(true);
        }, 300); // 300ms delay after header starts
        return () => clearTimeout(timer);
    }, []);

    const currentSlide = sliders?.[currentIndex];

    return (
        <motion.div
            ref={containerRef}
            className="relative min-h-screen bg-background"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.95 }}
            transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0
            }}
        >
            {loading ? (
                <div className="h-screen w-full bg-muted animate-pulse flex items-center justify-center">
                    <div className="text-muted-foreground">Loading experience...</div>
                </div>
            ) : !sliders || sliders.length === 0 ? (
                <div className="h-screen w-full flex items-center justify-center text-muted-foreground">
                    No slides available.
                </div>
            ) : (
                <div className="relative h-[200vh]">
                    <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center perspective-1000">
                        <motion.div
                            style={{
                                scale,
                                borderRadius,
                                y,
                                rotateX,
                                rotateY,
                            }}
                            className="relative w-full h-full overflow-hidden shadow-2xl transform-style-3d bg-black"
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={handleMouseLeave}
                            onMouseMove={handleMouseMove}
                        >
                            {/* Background Image Layer with Parallax */}
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    initial={{ opacity: 0, scale: 1.15 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Custom bezier for "luxury" ease
                                    className="absolute inset-0"
                                >
                                    {currentSlide && (
                                        <Image
                                            src={currentSlide.main_image_url}
                                            alt={currentSlide.title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    )}
                                    {/* Cinematic Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/90" />
                                    <div className="absolute inset-0 bg-black/10" />{" "}
                                    {/* Overall dim for text pop */}
                                </motion.div>
                            </AnimatePresence>

                            {/* Dynamic Glare Overlay */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 pointer-events-none mix-blend-overlay"
                                style={{
                                    background: glareBackground,
                                }}
                            />

                            {/* Content Overlay */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-8 md:p-16 pb-32">
                                <motion.div
                                    style={{ y: textY, opacity }}
                                    className="max-w-5xl space-y-8"
                                >
                                    {/* Kinetic Title */}
                                    <div className="overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            <div key={`title-${currentIndex}`}>
                                                {currentSlide && (
                                                    <AnimatedText
                                                        text={currentSlide.title}
                                                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl justify-center"
                                                        delay={0.2}
                                                    />
                                                )}
                                            </div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Kinetic Description */}
                                    <div className="overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            {currentSlide?.description && (
                                                <div key={`desc-${currentIndex}`}>
                                                    <motion.p
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: -20, opacity: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.4 }}
                                                        className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg"
                                                    >
                                                        {currentSlide.description}
                                                    </motion.p>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Magnetic Button */}
                                    <AnimatePresence mode="wait">
                                        {currentSlide?.button_text && (
                                            <motion.div
                                                key={`btn-${currentIndex}`}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                transition={{ duration: 0.5, delay: 0.6 }}
                                                className="pt-8"
                                            >
                                                <MagneticButton className="group relative inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-black transition-colors hover:bg-white/90">
                                                    {currentSlide.button_text}
                                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </MagneticButton>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute bottom-12 right-12 z-30 gap-4 hidden md:flex">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={prevSlide}
                                    className="rounded-full w-14 h-14 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={nextSlide}
                                    className="rounded-full w-14 h-14 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* Pagination Indicators */}
                            <div className="absolute bottom-12 left-12 z-30 flex gap-3">
                                {sliders.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setDirection(idx > currentIndex ? 1 : -1);
                                            setCurrentIndex(idx);
                                        }}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-500 shadow-lg backdrop-blur-sm",
                                            idx === currentIndex
                                                ? "w-12 bg-white"
                                                : "w-3 bg-white/30 hover:bg-white/50 hover:w-6"
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
