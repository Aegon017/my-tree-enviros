"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import BlogCard from "@/components/blog-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/types/blog";
import type { BreadcrumbItemType } from "@/types/home";
import {
  listBlogs,
  getBlogsSWRKey,
  type BlogApiItem,
} from "@/services/blog.service";

// Integrated with blog.service for listing and details

const Page = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR(
    getBlogsSWRKey({
      page: currentPage,
      per_page: 12,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    () =>
      listBlogs({
        page: currentPage,
        per_page: 12,
        sort_by: "created_at",
        sort_order: "desc",
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    mutate();
  };

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Blogs</AlertTitle>
          <AlertDescription>
            Failed to load blog posts. Please try again.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
        </div>
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
        <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
      </div>
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Our Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, stories, and updates from the My Tree Enviros team
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={`skeleton-${Date.now()}-${i}`} />
              ))
            : (data?.items ?? []).map((b: BlogApiItem) => {
                const blog: Blog = {
                  id: b.id,
                  title: b.title,
                  content: b.short_description ?? "",
                  main_image: "",
                  main_image_url: b.thumbnail_url ?? "",
                  slug: b.slug,
                  created_at: b.created_at ?? "",
                  created_by: 0,
                  updated_at: b.updated_at ?? "",
                  updated_by: 0,
                };
                return <BlogCard key={blog.id} blog={blog} />;
              })}
        </div>

        {data?.meta && data.meta.last_page > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={data.meta.current_page === 1}
                onClick={() => {
                  if (data.meta && data.meta.current_page > 1) {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    mutate();
                  }
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={data.meta.current_page === data.meta.last_page}
                onClick={() => {
                  if (
                    data.meta &&
                    data.meta.current_page < data.meta.last_page
                  ) {
                    setCurrentPage((p) => Math.min(data.meta.last_page, p + 1));
                    mutate();
                  }
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
