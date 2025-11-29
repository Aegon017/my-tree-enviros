"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import Section from "@/components/section";
import SectionTitle from "@/components/section-title";

import ProductCard from "@/components/product-card";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";

import BlogCard from "@/components/blog-card";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";

import { productService } from "@/services/product.services";
import { sliderService } from "@/services/slider.services";

import { useLocationStore } from "@/store/location-store";
import { useLocationTrees } from "@/hooks/use-location-trees";
import { useBlogData } from "@/hooks/use-blog-data";
import AppDownloadSection from "@/components/app-download-section";
import CinematicScrollHero from "@/components/hero-section";

export default function Home() {
  const { selected } = useLocationStore();

  const sliderAutoplayRef = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true }),
  );
  const blogAutoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  );

  const [products, setProducts] = useState<any[]>([]);
  const [sliders, setSliders] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingSliders, setLoadingSliders] = useState<boolean>(true);

  const {
    sponsorTrees,
    adoptTrees,
    loading: treesLoading,
  } = useLocationTrees(selected?.lat, selected?.lng);

  const { blogs, loading: loadingBlogs } = useBlogData({
    initialParams: {
      page: 1,
      per_page: 12,
      sort_by: "created_at",
      sort_order: "desc",
    },
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await productService.list({
          per_page: 4,
          sort_by: "created_at",
          sort_order: "desc",
          in_stock: true,
        });
        if (!cancelled && isMountedRef.current && res?.success) {
          setProducts(res.data?.products ?? []);
        }
      } catch (e) {
        if (!cancelled && isMountedRef.current) {
          setProducts([]);
        }
      } finally {
        if (!cancelled && isMountedRef.current) setLoadingProducts(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingSliders(true);
      try {
        const res = await sliderService.list({ active: true });
        if (!cancelled && isMountedRef.current) {
          setSliders(res?.data ?? []);
        }
      } catch (e) {
        if (!cancelled && isMountedRef.current) setSliders([]);
      } finally {
        if (!cancelled && isMountedRef.current) setLoadingSliders(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sliderPlugins = useMemo(() => [sliderAutoplayRef.current], []);
  const blogPlugins = useMemo(() => [blogAutoplayRef.current], []);

  const onMouseEnterBlog = () =>
    blogAutoplayRef.current && blogAutoplayRef.current.stop();
  const onMouseLeaveBlog = () =>
    blogAutoplayRef.current && blogAutoplayRef.current.reset();

  return (
    <div className="bg-background">
      <CinematicScrollHero />

      <Section className="pt-16 md:pt-20">
        <SectionTitle
          title="Natural Products"
          subtitle="Carefully curated from nature's bounty."
          align="center"
        />

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
            : products.map((product: any) => (
              <ProductCard key={product.slug} product={product} />
            ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/store">
            <Button>View All Products</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted/60">
        <SectionTitle
          title="Insights From Nature"
          subtitle="Stories, science, and slow growth."
          align="center"
        />

        {loadingBlogs ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{ loop: true }}
            plugins={blogPlugins}
            onMouseEnter={onMouseEnterBlog}
            onMouseLeave={onMouseLeaveBlog}
            className="mx-auto mt-10 max-w-6xl"
          >
            <CarouselContent>
              {blogs.map((b: any) => (
                <CarouselItem key={b.id} className="md:basis-1/2 lg:basis-1/3">
                  <BlogCard blog={b} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-6 flex justify-center gap-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        )}
      </Section>

      <AppDownloadSection />
    </div>
  );
}
