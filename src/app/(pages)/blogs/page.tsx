"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import BreadcrumbNav from "@/components/breadcrumb-nav";
import BlogCard from "@/components/blog-card";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { BlogListItem } from "@/types/blog.types";
import type { BreadcrumbItemType } from "@/types/home";

import { useBlogData } from "@/hooks/use-blog-data";
import PaginationWrapper from "@/components/pagination-wrapper";

export default function Page() {
  const [ page, setPage ] = useState( 1 );

  const { blogs, meta, loading, error, loadList } = useBlogData( {
    initialParams: {
      page,
      per_page: 12,
      sort_by: "created_at",
      sort_order: "desc",
    },
  } );

  const handlePageChange = ( p: number ) => {
    setPage( p );
    loadList(
      {
        page: p,
        per_page: 12,
        sort_by: "created_at",
        sort_order: "desc",
      },
      true
    );
  };

  if ( error ) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Blogs</AlertTitle>
          <AlertDescription>
            Failed to load blog posts. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItemType[] = [
    { title: "Home", href: "/" },
    { title: "Blogs", href: "" },
  ];

  return (
    <>
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={ breadcrumbItems } className="mb-6 py-4 px-4" />
      </div>

      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Our Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, stories, and updates from the My Tree Enviros team
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          { loading
            ? Array.from( { length: 6 } ).map( ( _, i ) => <BlogCardSkeleton key={ i } /> )
            : blogs.map( ( b: BlogListItem ) => <BlogCard key={ b.id } blog={ b } /> ) }
        </div>

        { meta && meta.last_page > 1 && (
          <div className="flex justify-center mt-12">
            <PaginationWrapper meta={ meta } onPageChange={ handlePageChange } />
          </div>
        ) }
      </div>
    </>
  );
}