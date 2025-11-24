"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import Section from "@/components/section";
import SectionTitle from "@/components/section-title";

import BasicTreeCard from "@/components/basic-tree-card";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";

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
import { MapPin } from "lucide-react";

import { productService } from "@/services/product.services";
import { sliderService } from "@/services/slider.services";

import { useLocationStore } from "@/store/location-store";
import { useLocationTrees } from "@/hooks/use-location-trees";
import { useBlogData } from "@/hooks/use-blog-data";
import InteractiveHero from "@/components/interactive-hero";
import AppDownloadSection from "@/components/app-download-section";

export default function Home() {
  const { selected } = useLocationStore();

  const sliderAutoplayRef = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true })
  );
  const blogAutoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const [products, setProducts] = useState<any[]>([]);
  const [sliders, setSliders] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingSliders, setLoadingSliders] = useState<boolean>(true);

  const { sponsorTrees, adoptTrees, loading: treesLoading } = useLocationTrees(
    selected?.lat,
    selected?.lng
  );

  const {
    blogs,
    loading: loadingBlogs,
  } = useBlogData({
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

  const onMouseEnterSlider = () =>
    sliderAutoplayRef.current && sliderAutoplayRef.current.stop();
  const onMouseLeaveSlider = () =>
    sliderAutoplayRef.current && sliderAutoplayRef.current.reset();

  const onMouseEnterBlog = () =>
    blogAutoplayRef.current && blogAutoplayRef.current.stop();
  const onMouseLeaveBlog = () =>
    blogAutoplayRef.current && blogAutoplayRef.current.reset();

  return (
    <div className="min-h-screen">
      <InteractiveHero sliders={sliders} loading={loadingSliders} />

      <Section>
        <SectionTitle
          title="Sponsor A Tree"
          subtitle="Sponsoring a tree helps create a sustainable future."
          align="center"
        />

        {selected && (
          <div className="mt-3 flex justify-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Showing trees near {selected.area}, {selected.city}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {treesLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <BasicTreeCardSkeleton key={i} />
            ))
          ) : !selected ? (
            <p className="col-span-5 text-center text-muted-foreground py-10">
              Please select a location.
            </p>
          ) : sponsorTrees.length === 0 ? (
            <p className="col-span-5 text-center text-muted-foreground py-10">
              No trees available near {selected.area}.
            </p>
          ) : (
            sponsorTrees.map((tree: any) => (
              <Link
                key={tree.id}
                href={`/sponsor-a-tree/${tree.slug}`}
                className="transition-transform hover:scale-105"
              >
                <BasicTreeCard name={tree.name} image={tree.thumbnail_url} />
              </Link>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/sponsor-a-tree">
            <Button>View All Trees</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle
          title="Adopt A Tree"
          subtitle="Adopting a tree supports long-term care."
          align="center"
        />

        {selected && (
          <div className="mt-3 flex justify-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Showing trees near {selected.area}, {selected.city}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {treesLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <BasicTreeCardSkeleton key={i} />
            ))
          ) : !selected ? (
            <p className="col-span-5 text-center text-muted-foreground py-10">
              Please select a location.
            </p>
          ) : adoptTrees.length === 0 ? (
            <p className="col-span-5 text-center text-muted-foreground py-10">
              No trees available near {selected.area}.
            </p>
          ) : (
            adoptTrees.map((tree: any) => (
              <Link
                key={tree.id}
                href={`/adopt-a-tree/${tree.slug}`}
                className="transition-transform hover:scale-105"
              >
                <BasicTreeCard name={tree.name} image={tree.thumbnail_url} />
              </Link>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/adopt-a-tree">
            <Button>View All Trees</Button>
          </Link>
        </div>
      </Section>
      
      <AppDownloadSection />

      <Section>
        <SectionTitle title="Natural Products" subtitle="From nature's bounty." align="center" />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product: any) => <ProductCard key={product.slug} product={product} />)}
        </div>

        <div className="text-center mt-8">
          <Link href="/store">
            <Button>View All Products</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle title="Insights From Nature" subtitle="Learn and explore." align="center" />

        {loadingBlogs ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : (
          <Carousel
            opts={{ loop: true }}
            plugins={blogPlugins}
            onMouseEnter={onMouseEnterBlog}
            onMouseLeave={onMouseLeaveBlog}
            className="mt-10 max-w-6xl mx-auto"
          >
            <CarouselContent>
              {blogs.map((b: any) => (
                <CarouselItem key={b.id} className="md:basis-1/2 lg:basis-1/3">
                  <BlogCard blog={b} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex justify-center mt-6 gap-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        )}
      </Section>
    </div>
  );
}