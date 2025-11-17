"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import BlogCard from "@/components/blog-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Blog, BlogListItem } from "@/types/blog.types";
import type { BreadcrumbItemType } from "@/types/home";
import { listBlogs } from "@/services/blog.service";

const Page = () => {
  const [ currentPage, setCurrentPage ] = useState( 1 );

  const { data, error, isLoading } = useSWR(
    [ "blogs", currentPage ],
    () =>
      listBlogs( {
        page: currentPage,
        per_page: 12,
        sort_by: "created_at",
        sort_order: "desc",
      } )
  );

  const blogs = data?.blogs ?? [];
  const meta = data?.meta;

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
          { isLoading
            ? Array.from( { length: 6 } ).map( ( _, i ) => (
              <BlogCardSkeleton key={ `skeleton-${ i }` } />
            ) )
            : blogs.map( ( b: BlogListItem ) => {
              const blog: BlogListItem = {
                id: b.id,
                slug: b.slug,
                title: b.title,
                category: b.category,
                short_description: b.short_description ?? "",
                thumbnail_url: b.thumbnail_url ?? "",
                created_at: b.created_at ?? "",
              };
              return <BlogCard key={ blog.id } blog={ blog } />;
            } ) }
        </div>

        { meta && meta.last_page > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={ meta.current_page === 1 }
                onClick={ () => setCurrentPage( ( p ) => p - 1 ) }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={ meta.current_page === meta.last_page }
                onClick={ () => setCurrentPage( ( p ) => p + 1 ) }
              >
                Next
              </Button>
            </div>
          </div>
        ) }
      </div>
    </>
  );
};

export default Page;