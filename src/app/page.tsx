"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useSWR from "swr";

import BasicTreeCard from "@/components/basic-tree-card";
import BlogCard from "@/components/blog-card";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";
import ProductCard from "@/components/product-card";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AlertCircle, MapPin, RefreshCw } from "lucide-react";

import neemTree from "../../public/neem-tree.webp";

import { useLocation } from "@/hooks/use-location";
import { treeService } from "@/services/tree.service";
import { productService } from "@/services/product.service";
import { listBlogs } from "@/services/blog.service";
import { getSlidersSWRKey, listSliders } from "@/services/slider.service";

import type { TreeListItem } from "@/types/tree.types";
import type { ProductListItem } from "@/types/product.types";
import type { SliderApiItem } from "@/services/slider.service";
import { Blog, BlogListItem } from "@/types/blog.types";

const PRODUCTS_KEY = [ "home-products" ] as const;

function useCarouselAutoplay( delayMs: number ) {
  const ref = useRef( Autoplay( { delay: delayMs, stopOnInteraction: true } ) );
  return ref;
}

function useLocationTrees( lat?: number, lng?: number, deps: any[] = [] ) {
  const [ sponsorTrees, setSponsorTrees ] = useState<TreeListItem[]>( [] );
  const [ adoptTrees, setAdoptTrees ] = useState<TreeListItem[]>( [] );
  const [ loading, setLoading ] = useState( false );
  const [ error, setError ] = useState<Error | null>( null );

  useEffect( () => {
    if ( typeof lat !== "number" || typeof lng !== "number" ) {
      setSponsorTrees( [] );
      setAdoptTrees( [] );
      setError( null );
      setLoading( false );
      return;
    }

    let active = true;
    const controller = new AbortController();

    const fetchTrees = async () => {
      setLoading( true );
      setError( null );
      try {
        const [ sponsorResponse, adoptResponse ] = await Promise.all( [
          treeService.getTrees( { user_lat: lat, user_lng: lng, radius_km: 50, per_page: 5, type: 'sponsor' } ),
          treeService.getTrees( { user_lat: lat, user_lng: lng, radius_km: 50, per_page: 5, type: 'adopt' } ),
        ] );

        if ( !active ) return;

        setSponsorTrees( sponsorResponse?.data?.trees ?? [] );
        setAdoptTrees( adoptResponse?.data?.trees ?? [] );
      } catch ( err ) {
        if ( !active ) return;
        setError( err as Error );
      } finally {
        if ( active ) setLoading( false );
      }
    };

    fetchTrees();

    return () => {
      active = false;
      controller.abort();
    };
  }, deps );

  return { sponsorTrees, adoptTrees, loading, error } as const;
}

export default function Home() {
  const plugin = useCarouselAutoplay( 2000 );
  const blogPlugin = useCarouselAutoplay( 4000 );
  const { selectedLocation } = useLocation();

  const lat = selectedLocation?.lat;
  const lng = selectedLocation?.lng;

  const { sponsorTrees, adoptTrees, loading: treesLoading, error: treesError } =
    useLocationTrees( lat, lng, [ lat, lng ] );

  const { data: productsList, error: productsError, isLoading: productsLoading } = useSWR(
    PRODUCTS_KEY,
    () =>
      productService.getProducts( { per_page: 4, sort_by: "created_at", sort_order: "desc", in_stock: true } ),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data, error: blogsError, isLoading: blogsLoading } = useSWR(
    [ "blogs", 1 ],
    () =>
      listBlogs( {
        page: 1,
        per_page: 12,
        sort_by: "created_at",
        sort_order: "desc",
      } )
  );

  const blogs = data?.blogs ?? [];

  const { data: slidersList } = useSWR( getSlidersSWRKey( { active: true } ), () => listSliders( { active: true } ) );

  const products = productsList?.data?.products ?? [];

  const sliders = slidersList ?? [];

  if ( productsError ) {
    return (
      <Section className="bg-background">
        <Alert variant="destructive">
          <AlertDescription>Failed to load products. Please try again later.</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={ () => window.location.reload() }>Try Again</Button>
        </div>
      </Section>
    );
  }

  return (
    <div className="min-h-screen">
      <Carousel opts={ { align: "start", loop: true } } plugins={ [ plugin.current ] } className="w-full relative" onMouseEnter={ plugin.current.stop } onMouseLeave={ plugin.current.reset }>
        <CarouselContent>
          { sliders.map( ( slider: SliderApiItem ) => (
            <CarouselItem key={ slider.id }>
              <Card className="overflow-hidden p-0 rounded-none">
                <CardContent className="flex items-center justify-center p-0 h-dvh relative">
                  <Image src={ slider.main_image_url || neemTree } alt={ slider.title || "Slider image" } fill priority className="object-cover object-center" />
                </CardContent>
              </Card>
            </CarouselItem>
          ) ) }
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>

      <Section className="bg-background">
        <div className="flex flex-col items-center mb-6">
          <SectionTitle
            title="Sponsor A Tree"
            subtitle="Sponsoring a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity."
            align="center"
          />
        </div>

        { selectedLocation && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <MapPin className="h-4 w-4" />
            <span>
              Showing trees near <strong>{ selectedLocation.area }, { selectedLocation.city }</strong>
            </span>
          </div>
        ) }

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 justify-center gap-6">
          { treesLoading ? (
            Array.from( { length: 5 } ).map( ( _, i ) => <BasicTreeCardSkeleton key={ `sponsor-skeleton-${ i }` } /> )
          ) : treesError ? (
            <div className="col-span-5 text-center">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load trees. Please try again later.</AlertDescription>
              </Alert>
            </div>
          ) : !selectedLocation ? (
            <div className="col-span-5 text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Please select a location to view available trees</p>
            </div>
          ) : sponsorTrees.length === 0 ? (
            <div className="col-span-5 text-center py-12">
              <p className="text-lg text-muted-foreground">No trees available for sponsorship near <strong>{ selectedLocation.area }, { selectedLocation.city }</strong></p>
            </div>
          ) : (
            sponsorTrees.map( ( tree: TreeListItem ) => (
              <Link key={ tree.id } href={ `/sponsor-a-tree/${ tree.slug }` } className="transition-transform hover:scale-105">
                <BasicTreeCard name={ tree.name } image={ tree.thumbnail_url } />
              </Link>
            ) )
          ) }
        </div>

        <div className="text-center mt-8">
          <Link href="/sponsor-a-tree">
            <Button>View All Trees</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted">
        <div className="flex flex-col items-center mb-6">
          <SectionTitle
            title="Adopt A Tree"
            subtitle="Adopt a tree and become a guardian of nature. Your adoption supports tree care, nurturing, and long-term sustainability, ensuring a greener tomorrow."
            align="center"
          />
        </div>

        { selectedLocation && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <MapPin className="h-4 w-4" />
            <span>
              Showing trees near <strong>{ selectedLocation.area }, { selectedLocation.city }</strong>
            </span>
          </div>
        ) }

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 justify-center gap-6">
          { treesLoading ? (
            Array.from( { length: 5 } ).map( ( _, i ) => <BasicTreeCardSkeleton key={ `adopt-skeleton-${ i }` } /> )
          ) : treesError ? (
            <div className="col-span-5 text-center">
              <Alert variant="destructive">
                <AlertDescription>Failed to load trees. Please try again later.</AlertDescription>
              </Alert>
            </div>
          ) : !selectedLocation ? (
            <div className="col-span-5 text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Please select a location to view available trees</p>
            </div>
          ) : adoptTrees.length === 0 ? (
            <div className="col-span-5 text-center py-12">
              <p className="text-lg text-muted-foreground">No trees available for adoption near <strong>{ selectedLocation.area }, { selectedLocation.city }</strong></p>
            </div>
          ) : (
            adoptTrees.map( ( tree: TreeListItem ) => (
              <Link key={ tree.id } href={ `/adopt-a-tree/${ tree.slug }` } className="transition-transform hover:scale-105">
                <BasicTreeCard name={ tree.name } image={ tree.thumbnail_url } />
              </Link>
            ) )
          ) }
        </div>

        <div className="text-center mt-8">
          <Link href="/adopt-a-tree">
            <Button>View All Trees</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-background">
        <SectionTitle
          title="Natural Goodness from Trees"
          subtitle="Discover a wide range of organic products derived directly from nature's bounty. From nourishing oils to flavorful spices and eco-friendly raw materials."
          align="center"
        />

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          { productsLoading
            ? Array.from( { length: 4 } ).map( ( _, i ) => <ProductCardSkeleton key={ `product-skeleton-${ i }` } /> )
            : products.map( ( product: ProductListItem ) => <ProductCard key={ product.slug } product={ product } /> ) }
        </div>

        <div className="text-center mt-8">
          <Link href="/store">
            <Button>View All Products</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle title="Insights from Nature's Wisdom" subtitle="Explore our blog for tips, stories, and ideas on sustainable living, tree care, and the impact of organic products." align="center" />

        { blogsError ? (
          <div className="max-w-4xl mx-auto mt-8">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Blogs</AlertTitle>
              <AlertDescription>Failed to load blog posts. Please try again.</AlertDescription>
            </Alert>
          </div>
        ) : (
          <Carousel opts={ { align: "start", loop: true } } plugins={ [ blogPlugin.current ] } className="w-full max-w-6xl mx-auto mt-8" onMouseEnter={ blogPlugin.current.stop } onMouseLeave={ blogPlugin.current.reset }>
            <CarouselContent>
              { blogsLoading
                ? Array.from( { length: 3 } ).map( ( _, i ) => <BlogCardSkeleton key={ `blog-skeleton-${ i }` } /> )
                : blogs.map( ( blog: BlogListItem ) => (
                  <CarouselItem key={ blog.id } className="md:basis-1/2 lg:basis-1/3">
                    <BlogCard blog={ blog } />
                  </CarouselItem>
                ) ) }
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-4">
              <CarouselPrevious className="static transform-none" />
              <CarouselNext className="static transform-none" />
            </div>
          </Carousel>
        ) }
      </Section>
    </div>
  );
}