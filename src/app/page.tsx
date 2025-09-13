'use client'

import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useRef } from "react";
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
import neemTree from '../../public/neem-tree.webp';
import BlogCard from "@/components/blog-card";
import AppLayout from "@/components/app-layout";

// Define interfaces for better type safety
interface Product {
  category: string;
  name: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
  rating: number;
  imageUrl: StaticImageData;
  imageAlt: string;
}

interface BlogPost {
  id: number;
  date: Date;
  title: string;
  description: string;
  commentCount: number;
  imageUrl: StaticImageData;
  imageAlt: string;
}

interface PromoCard {
  id: number;
  image: StaticImageData;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

export default function Home() {
  const plugin = useRef( Autoplay( { delay: 2000, stopOnInteraction: true } ) );
  const blogPlugin = useRef( Autoplay( { delay: 4000, stopOnInteraction: true } ) );

  // Sample carousel items
  const carouselItems = [
    {
      id: '1',
      content: 'Promotion 1',
      bgColor: 'bg-amber-200'
    },
    {
      id: '2',
      content: 'Promotion 2',
      bgColor: 'bg-emerald-100'
    },
    {
      id: '3',
      content: 'Promotion 3',
      bgColor: 'bg-sky-100'
    },
    {
      id: '4',
      content: 'Promotion 4',
      bgColor: 'bg-rose-100'
    },
    {
      id: '5',
      content: 'Promotion 5',
      bgColor: 'bg-violet-100'
    }
  ];

  const treeCards = [
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
      description: "Nurture the roots of sustainability—feed a tree and help it thrive. Together, let's grow a greener future.",
      linkText: "Feed Now",
      linkUrl: "/feed-now"
    },
    {
      id: 2,
      image: neemTree,
      title: "Plant A Tree",
      description: "Join us in planting trees and creating a healthier, greener environment for all.",
      linkText: "Plant Now",
      linkUrl: "/plant-now"
    },
  ];

  const products: Product[] = [
    {
      category: 'Herbal Products',
      name: 'Neem Powder',
      description: 'Pure organic neem powder for skincare and health benefits. 100% natural and chemical-free.',
      originalPrice: '59.00',
      discountedPrice: '49.00',
      discountPercentage: 17,
      rating: 4.5,
      imageUrl: neemTree,
      imageAlt: 'Neem Powder'
    },
    {
      category: 'Herbal Products',
      name: 'Neem Oil',
      description: 'Cold-pressed neem oil for hair care and organic farming. Free from additives.',
      originalPrice: '79.00',
      discountedPrice: '69.00',
      discountPercentage: 13,
      rating: 5,
      imageUrl: neemTree,
      imageAlt: 'Neem Oil'
    },
    {
      category: 'Herbal Products',
      name: 'Neem Soap',
      description: 'Ayurvedic neem soap for clear and healthy skin. Gentle and effective.',
      originalPrice: '45.00',
      discountedPrice: '39.00',
      discountPercentage: 15,
      rating: 4.3,
      imageUrl: neemTree,
      imageAlt: 'Neem Soap'
    }
  ];

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      date: new Date( 2023, 2, 27 ),
      title: "The Power of Trees: Nature's Climate Warriors",
      description: "Discover how trees combat climate change and create a healthier planet for all.",
      commentCount: 0,
      imageUrl: neemTree,
      imageAlt: "Tree in nature"
    },
    {
      id: 2,
      date: new Date( 2023, 3, 15 ),
      title: "Sustainable Farming Practices for a Better Tomorrow",
      description: "Learn about eco-friendly farming techniques that protect our environment.",
      commentCount: 3,
      imageUrl: neemTree,
      imageAlt: "Sustainable farming"
    },
    {
      id: 3,
      date: new Date( 2023, 4, 5 ),
      title: "The Healing Properties of Neem: Ancient Remedy, Modern Uses",
      description: "Explore the many health benefits of neem and how it's used today.",
      commentCount: 7,
      imageUrl: neemTree,
      imageAlt: "Neem leaves"
    },
    {
      id: 4,
      date: new Date( 2023, 5, 18 ),
      title: "Community Gardening: Bringing People Together",
      description: "How community gardens foster connections and promote sustainable living.",
      commentCount: 2,
      imageUrl: neemTree,
      imageAlt: "Community garden"
    },
    {
      id: 5,
      date: new Date( 2023, 6, 22 ),
      title: "The Importance of Biodiversity in Urban Spaces",
      description: "Why cities need diverse plant life and how to incorporate it.",
      commentCount: 5,
      imageUrl: neemTree,
      imageAlt: "Urban greenery"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Main Carousel */ }
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
                  <CardContent className={ `${ item.bgColor } flex items-center justify-center p-0 h-80 md:h-96` }>
                    <span className="text-4xl font-semibold">{ item.content }</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ) ) }
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>

        {/* Sponsor A Tree Section */ }
        <Section className="bg-background py-12">
          <SectionTitle
            title="Sponsor A Tree"
            subtitle="Sponsoring a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 justify-center gap-6">
            { treeCards.map( ( tree ) => (
              <Link key={ tree.id } href="/" className="transition-transform hover:scale-105">
                <BasicTreeCard name={ tree.name } image={ tree.image } />
              </Link>
            ) ) }
          </div>
        </Section>

        {/* Promo Cards Section */ }
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

        {/* Products Section */ }
        <Section className="bg-background py-12">
          <SectionTitle
            title="Natural Goodness from Trees"
            subtitle="Discover a wide range of organic products derived directly from nature's bounty. From nourishing oils to flavorful spices and eco-friendly raw materials."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            { products.map( ( product ) => (
              <Link key={ product.name } href="/" className="w-full max-w-sm">
                <EcommerceCard
                  category={ product.category }
                  name={ product.name }
                  description={ product.description }
                  originalPrice={ product.originalPrice }
                  discountedPrice={ product.discountedPrice }
                  discountPercentage={ product.discountPercentage }
                  rating={ product.rating }
                  imageUrl={ product.imageUrl }
                  imageAlt={ product.imageAlt }
                />
              </Link>
            ) ) }
          </div>
        </Section>

        {/* Blog Section */ }
        <Section className="bg-muted py-12">
          <SectionTitle
            title="Insights from Nature's Wisdom"
            subtitle="Explore our blog for tips, stories, and ideas on sustainable living, tree care, and the impact of organic products."
            align="center"
          />

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
              { blogPosts.map( ( post ) => (
                <CarouselItem key={ post.id } className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2 h-full">
                    <BlogCard
                      date={ post.date }
                      title={ post.title }
                      description={ post.description }
                      commentCount={ post.commentCount }
                      imageUrl={ post.imageUrl }
                      imageAlt={ post.imageAlt }
                    />
                  </div>
                </CarouselItem>
              ) ) }
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-4">
              <CarouselPrevious className="static transform-none" />
              <CarouselNext className="static transform-none" />
            </div>
          </Carousel>
        </Section>
      </div>
    </AppLayout>
  );
}