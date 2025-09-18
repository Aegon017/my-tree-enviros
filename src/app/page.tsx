"use client";

import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import BasicTreeCard from "@/components/basic-tree-card";
import EcommerceCard from "@/components/ecommerce-card";
import PromoTreeCard from "@/components/promo-tree-card";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import neemTree from "../../public/neem-tree.webp";
import BlogCard from "@/components/blog-card";
import AppLayout from "@/components/app-layout";
import type { Product } from "@/types/product";
import useSWR from "swr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EcommerceCardSkeleton from "@/components/skeletons/ecommerce-card-skeleton";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Blog } from "@/types/blog";
import { AlertCircle, RefreshCw } from "lucide-react";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";

interface PromoCard {
  id: number;
  image: StaticImageData;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

interface CarouselItemType {
  id: string;
  content: string;
  bgColor: string;
}

interface TreeCard {
  id: string;
  name: string;
  image: StaticImageData;
}

interface BlogApiResponse {
  data: Blog[];
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

const carouselItems: CarouselItemType[] = [
  {
    id: "1",
    content: "Promotion 1",
    bgColor: "bg-amber-200",
  },
  {
    id: "2",
    content: "Promotion 2",
    bgColor: "bg-emerald-100",
  },
  {
    id: "3",
    content: "Promotion 3",
    bgColor: "bg-sky-100",
  },
  {
    id: "4",
    content: "Promotion 4",
    bgColor: "bg-rose-100",
  },
  {
    id: "5",
    content: "Promotion 5",
    bgColor: "bg-violet-100",
  },
];

const treeCards: TreeCard[] = [
  { id: "tree-1", name: "NEEM TREE", image: neemTree },
  { id: "tree-2", name: "MANGO TREE", image: neemTree },
  { id: "tree-3", name: "BANYAN TREE", image: neemTree },
  { id: "tree-4", name: "PEEPAL TREE", image: neemTree },
  { id: "tree-5", name: "TULSI PLANT", image: neemTree },
];

const promoCards: PromoCard[] = [
  {
    id: 1,
    image: neemTree,
    title: "Feed A Tree",
    description:
      "Nurture the roots of sustainability—feed a tree and help it thrive. Together, let's grow a greener future.",
    linkText: "Feed Now",
    linkUrl: "/feed-now",
  },
  {
    id: 2,
    image: neemTree,
    title: "Plant A Tree",
    description:
      "Join us in planting trees and creating a healthier, greener environment for all.",
    linkText: "Plant Now",
    linkUrl: "/plant-now",
  },
];

const blogFetcher = async ( url: string ) => {
  const res = await fetch( url );
  if ( !res.ok ) throw new Error( "Failed to fetch blogs" );
  return res.json();
};

const productFetcher = async ( url: string ) => {
  const res = await fetch( url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${ storage.getToken() }`,
    },
  } );
  if ( !res.ok ) throw new Error( "Failed to fetch products" );
  return res.json();
};

export default function Home() {
  const plugin = useRef( Autoplay( { delay: 2000, stopOnInteraction: true } ) );
  const blogPlugin = useRef( Autoplay( { delay: 4000, stopOnInteraction: true } ) );
  const [ blogRetryCount, setBlogRetryCount ] = useState( 0 );

  const { data: productsData, error: productsError, isLoading: productsLoading } = useSWR(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/products`,
    productFetcher
  );

  const {
    data: blogsData,
    error: blogsError,
    isLoading: blogsLoading,
    mutate: mutateBlogs
  } = useSWR<BlogApiResponse>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/blogs?retry=${ blogRetryCount }`,
    blogFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const products = productsData?.data?.data;
  const blogs = blogsData?.data;

  const handleBlogRetry = () => {
    setBlogRetryCount( prev => prev + 1 );
    mutateBlogs();
  };

  if ( productsError ) {
    return (
      <AppLayout>
        <Section className="bg-background py-12">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load products. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={ () => window.location.reload() }>Try Again</Button>
          </div>
        </Section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        <Carousel
          opts={ {
            align: "start",
            loop: true,
          } }
          plugins={ [ plugin.current ] }
          className="w-full relative"
          onMouseEnter={ plugin.current.stop }
          onMouseLeave={ plugin.current.reset }
        >
          <CarouselContent>
            { carouselItems.map( ( item ) => (
              <CarouselItem key={ item.id }>
                <Card className="overflow-hidden p-0 rounded-none">
                  <CardContent
                    className={ `${ item.bgColor } flex items-center justify-center p-0 h-80 md:h-96` }
                  >
                    <span className="text-4xl font-semibold">
                      { item.content }
                    </span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ) ) }
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>

        <Section className="bg-background py-12">
          <SectionTitle
            title="Sponsor A Tree"
            subtitle="Sponsoring a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 justify-center gap-6">
            { treeCards.map( ( tree ) => (
              <Link
                key={ tree.id }
                href="/"
                className="transition-transform hover:scale-105"
              >
                <BasicTreeCard name={ tree.name } image={ tree.image } />
              </Link>
            ) ) }
          </div>
        </Section>

        <Section className="bg-muted py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            { promoCards.map( ( promo ) => (
              <PromoTreeCard
                key={ promo.id }
                image={ promo.image }
                title={ promo.title }
                description={ promo.description }
                linkText={ promo.linkText }
                linkUrl={ promo.linkUrl }
              />
            ) ) }
          </div>
        </Section>

        <Section className="bg-background py-12">
          <SectionTitle
            title="Natural Goodness from Trees"
            subtitle="Discover a wide range of organic products derived directly from nature's bounty. From nourishing oils to flavorful spices and eco-friendly raw materials."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            { productsLoading
              ? Array.from( { length: 6 } ).map( ( _, i ) => (
                <EcommerceCardSkeleton key={ i } />
              ) )
              : products?.map( ( product: Product ) => (
                <EcommerceCard key={ product.id } product={ product } />
              ) ) }
          </div>
        </Section>

        <Section className="bg-muted py-12">
          <SectionTitle
            title="Insights from Nature's Wisdom"
            subtitle="Explore our blog for tips, stories, and ideas on sustainable living, tree care, and the impact of organic products."
            align="center"
          />

          { blogsError ? (
            <div className="max-w-4xl mx-auto mt-8">
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Blogs</AlertTitle>
                <AlertDescription>
                  Failed to load blog posts. Please try again.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Button onClick={ handleBlogRetry } className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Loading
                </Button>
              </div>
            </div>
          ) : (
            <Carousel
              opts={ {
                align: "start",
                loop: true,
              } }
              plugins={ [ blogPlugin.current ] }
              className="w-full max-w-6xl mx-auto mt-8"
              onMouseEnter={ blogPlugin.current.stop }
              onMouseLeave={ blogPlugin.current.reset }
            >
              <CarouselContent>
                { blogsLoading ? (
                  Array.from( { length: 3 } ).map( ( _, i ) => (
                    <BlogCardSkeleton key={ i } />
                  ) )
                ) : (
                  blogs?.map( ( blog: Blog ) => (
                    <CarouselItem
                      key={ blog.id }
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <BlogCard blog={ blog } />
                    </CarouselItem>
                  ) )
                ) }
              </CarouselContent>
              <div className="flex justify-center mt-8 gap-4">
                <CarouselPrevious className="static transform-none" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>
          ) }
        </Section>
      </div>
    </AppLayout>
  );
}