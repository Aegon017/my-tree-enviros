"use client";

import { Markup } from "interweave";
import {
  Calendar,
  Check,
  Facebook,
  Link2,
  Linkedin,
  Share2,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";

import BreadcrumbNav from "@/components/breadcrumb-nav";
import BlogDetailsSkeleton from "@/components/skeletons/blog-details-skeleton";
import { Button } from "@/components/ui/button";

import type { BreadcrumbItemType } from "@/types/home";
import { useBlogData } from "@/hooks/use-blog-data";

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Blogs", href: "/blogs" },
];

export default function Page( {
  params,
}: {
  params: Promise<{ slug: string }>;
} ) {
  const { slug } = use( params );
  const router = useRouter();

  const { blog, loading, error } = useBlogData( { slug } );

  const [ copied, setCopied ] = useState( false );
  const [ showShareTooltip, setShowShareTooltip ] = useState( false );

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const formattedDate = useMemo( () => {
    if ( !blog?.created_at ) return "";
    return new Date( blog.created_at ).toLocaleDateString( "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    } );
  }, [ blog?.created_at ] );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText( shareUrl );
      setCopied( true );
      setTimeout( () => setCopied( false ), 2000 );
    } catch ( err ) {
      console.error( "Copy failed:", err );
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://facebook.com/sharer/sharer.php?u=${ encodeURIComponent(
        shareUrl
      ) }`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${ encodeURIComponent(
        shareUrl
      ) }&text=${ encodeURIComponent( blog?.title || "" ) }`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://linkedin.com/sharing/share-offsite/?url=${ encodeURIComponent(
        shareUrl
      ) }`,
    },
  ];

  if ( error ) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Failed to load blog
          </h1>
          <p className="text-muted-foreground mb-6">
            Please try again or go back.
          </p>
        </div>
      </div>
    );
  }

  if ( loading || !blog ) return <BlogDetailsSkeleton />;

  return (
    <>
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={ breadcrumbItems } className="mb-6 py-4 px-4" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 pb-8">
        <article className="bg-card rounded-xl border overflow-hidden">
          {/* Image */ }
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={ blog.image_url ?? "/placeholder.svg" }
              alt={ blog.title }
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Content */ }
          <div className="p-6">
            {/* Meta Info */ }
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                { formattedDate }
              </div>

              <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />

              <div className="capitalize">{ blog.category?.name }</div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              { blog.title }
            </h1>

            <Markup
              content={ blog.description ?? "" }
              className="prose max-w-none dark:prose-invert"
            />

            {/* Share Section */ }
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share this post
                </h3>

                <div className="flex items-center gap-2">
                  { socialLinks.map( ( s ) => (
                    <Button
                      key={ s.name }
                      variant="outline"
                      size="icon"
                      asChild
                      className="rounded-full hover:bg-primary hover:text-primary-foreground"
                    >
                      <a href={ s.url } target="_blank" rel="noopener noreferrer">
                        <s.icon className="h-4 w-4" />
                      </a>
                    </Button>
                  ) ) }

                  {/* Copy Link */ }
                  <div className="relative">
                    <Button
                      variant={ copied ? "default" : "outline" }
                      size="icon"
                      className="rounded-full"
                      onClick={ handleCopyLink }
                      onMouseEnter={ () => setShowShareTooltip( true ) }
                      onMouseLeave={ () => setShowShareTooltip( false ) }
                    >
                      { copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      ) }
                    </Button>

                    {/* Tooltip */ }
                    { showShareTooltip && !copied && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-primary text-white rounded shadow">
                        Copy Link
                      </div>
                    ) }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}