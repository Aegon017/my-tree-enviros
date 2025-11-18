"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  CarouselPrevious
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import neemTree from "../../public/neem-tree.webp";

import { productService } from "@/services/product.service";
import { sliderService } from "@/services/slider.service";

import { useLocationStore } from "@/store/location-store";
import { useLocationTrees } from "@/hooks/use-location-trees";
import { useBlogData } from "@/hooks/use-blog-data";

export default function Home() {
  const { selected } = useLocationStore();

  const sliderAutoplay = useRef(
    Autoplay( { delay: 2500, stopOnInteraction: true } )
  );

  const blogAutoplay = useRef(
    Autoplay( { delay: 4000, stopOnInteraction: true } )
  );

  const [ products, setProducts ] = useState( [] );
  const [ sliders, setSliders ] = useState( [] );
  const [ loadingProducts, setLoadingProducts ] = useState( true );
  const [ loadingSliders, setLoadingSliders ] = useState( true );

  const { sponsorTrees, adoptTrees, loading: treesLoading } =
    useLocationTrees( selected?.lat, selected?.lng );

  const { blogs, loading: loadingBlogs } = useBlogData( {
    listParams: {
      page: 1,
      per_page: 12,
      sort_by: "created_at",
      sort_order: "desc"
    }
  } );

  useEffect( () => {
    const loadProducts = async () => {
      setLoadingProducts( true );
      try {
        const res = await productService.list( {
          per_page: 4,
          sort_by: "created_at",
          sort_order: "desc",
          in_stock: true
        } );
        setProducts( res.data?.products ?? [] );
      } finally {
        setLoadingProducts( false );
      }
    };
    loadProducts();
  }, [] );

  useEffect( () => {
    const loadSliders = async () => {
      setLoadingSliders( true );
      try {
        const res = await sliderService.list( { active: true } );
        setSliders( res.data ?? [] );
      } finally {
        setLoadingSliders( false );
      }
    };
    loadSliders();
  }, [] );

  return (
    <div className="min-h-screen">

      <Carousel
        plugins={ [ sliderAutoplay.current ] }
        opts={ { loop: true } }
        onMouseEnter={ sliderAutoplay.current.stop }
        onMouseLeave={ sliderAutoplay.current.reset }
        className="w-full relative"
      >
        <CarouselContent>
          { ( loadingSliders ? Array.from( { length: 1 } ) : sliders ).map(
            ( slider: any, idx: number ) => (
              <CarouselItem key={ slider?.id ?? idx }>
                <div className="relative h-dvh">
                  <Image
                    src={ slider?.main_image_url || neemTree }
                    alt={ slider?.title || "Slider" }
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            )
          ) }
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>

      <Section>
        <SectionTitle
          title="Sponsor A Tree"
          subtitle="Sponsoring a tree helps create a sustainable future."
          align="center"
        />

        { selected && (
          <div className="mt-3 flex justify-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Showing trees near { selected.area }, { selected.city }
          </div>
        ) }

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          { treesLoading
            ? Array.from( { length: 5 } ).map( ( _, i ) => (
              <BasicTreeCardSkeleton key={ i } />
            ) )
            : !selected
              ? <p className="col-span-5 text-center text-muted-foreground py-10">Please select a location.</p>
              : sponsorTrees.length === 0
                ? <p className="col-span-5 text-center text-muted-foreground py-10">No trees available near { selected.area }.</p>
                : sponsorTrees.map( ( tree: any ) => (
                  <Link
                    key={ tree.id }
                    href={ `/sponsor-a-tree/${ tree.slug }` }
                    className="transition-transform hover:scale-105"
                  >
                    <BasicTreeCard name={ tree.name } image={ tree.thumbnail_url } />
                  </Link>
                ) ) }
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

        { selected && (
          <div className="mt-3 flex justify-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Showing trees near { selected.area }, { selected.city }
          </div>
        ) }

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          { treesLoading
            ? Array.from( { length: 5 } ).map( ( _, i ) => (
              <BasicTreeCardSkeleton key={ i } />
            ) )
            : !selected
              ? <p className="col-span-5 text-center text-muted-foreground py-10">Please select a location.</p>
              : adoptTrees.length === 0
                ? <p className="col-span-5 text-center text-muted-foreground py-10">No trees available near { selected.area }.</p>
                : adoptTrees.map( ( tree: any ) => (
                  <Link
                    key={ tree.id }
                    href={ `/adopt-a-tree/${ tree.slug }` }
                    className="transition-transform hover:scale-105"
                  >
                    <BasicTreeCard name={ tree.name } image={ tree.thumbnail_url } />
                  </Link>
                ) ) }
        </div>

        <div className="text-center mt-8">
          <Link href="/adopt-a-tree">
            <Button>View All Trees</Button>
          </Link>
        </div>
      </Section>

      <Section>
        <SectionTitle
          title="Natural Products"
          subtitle="From nature's bounty."
          align="center"
        />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          { loadingProducts
            ? Array.from( { length: 4 } ).map( ( _, i ) => (
              <ProductCardSkeleton key={ i } />
            ) )
            : products.map( ( product: any ) => (
              <ProductCard key={ product.slug } product={ product } />
            ) ) }
        </div>

        <div className="text-center mt-8">
          <Link href="/store">
            <Button>View All Products</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle
          title="Insights From Nature"
          subtitle="Learn and explore."
          align="center"
        />

        { loadingBlogs ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { Array.from( { length: 3 } ).map( ( _, i ) => (
              <BlogCardSkeleton key={ i } />
            ) ) }
          </div>
        ) : (
          <Carousel
            opts={ { loop: true } }
            plugins={ [ blogAutoplay.current ] }
            onMouseEnter={ blogAutoplay.current.stop }
            onMouseLeave={ blogAutoplay.current.reset }
            className="mt-10 max-w-6xl mx-auto"
          >
            <CarouselContent>
              { blogs.map( ( b: any ) => (
                <CarouselItem key={ b.id } className="md:basis-1/2 lg:basis-1/3">
                  <BlogCard blog={ b } />
                </CarouselItem>
              ) ) }
            </CarouselContent>

            <div className="flex justify-center mt-6 gap-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        ) }
      </Section>
    </div>
  );
}