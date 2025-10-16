"use client";

import { Markup } from "interweave";
import {
  BookOpen,
  Calendar,
  Check,
  Facebook,
  Heart,
  Link2,
  Linkedin,
  Share2,
  Tags,
  Twitter,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import BlogDetailsSkeleton from "@/components/skeletons/blog-details-skeleton";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/types/blog";
import type { BreadcrumbItemType } from "@/types/home";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApiResponse {
  data: Blog;
}

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error("Failed to fetch blog details");
    return await res.json();
  });

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Blogs", href: "" },
];

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [copied, setCopied] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    id ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}` : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const blog = data?.data;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const formattedDate = useMemo(() => {
    if (!blog?.created_at) return "";
    return new Date(blog.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [blog?.created_at]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareButtons = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-500 hover:text-white",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog?.title || "")}`,
      color: "hover:bg-blue-400 hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
  ];

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Error Loading Blog
          </h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't load the blog post. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => mutate()}>Try Again</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );

  if (isLoading) return <BlogDetailsSkeleton />;

  return (
    <>
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
      </div>
      <div className="container max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-5 gap-8 justify-center">
          <div className="col-span-5 lg:col-span-4">
            <article className="bg-card rounded-xl border overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96">
                <Image
                  src={blog?.main_image_url ?? "/placeholder.svg"}
                  alt={blog?.title || "Blog image"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/50"></div>
                  <div className="capitalize">
                    {blog?.status === 1 ? "Published" : "Draft"}
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                  {blog?.title}
                </h1>

                <Markup
                  className="max-w-none text-foreground mb-8"
                  content={blog?.content}
                />

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <Share2 className="mr-2 h-5 w-5" />
                      Share this post
                    </h3>

                    <div className="flex items-center gap-2">
                      {shareButtons.map((social) => (
                        <Button
                          key={social.name}
                          variant="outline"
                          size="icon"
                          className={`rounded-full ${social.color} transition-colors`}
                          asChild
                        >
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Share on ${social.name}`}
                          >
                            <social.icon className="h-4 w-4" />
                          </a>
                        </Button>
                      ))}

                      <div className="relative">
                        <Button
                          variant={copied ? "default" : "outline"}
                          size="icon"
                          className="rounded-full"
                          onClick={handleCopyLink}
                          onMouseEnter={() => setShowShareTooltip(true)}
                          onMouseLeave={() => setShowShareTooltip(false)}
                          aria-label="Copy link to clipboard"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </Button>

                        {showShareTooltip && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded shadow-lg">
                            Copy link
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div className="hidden lg:block col-span-1 sticky top-20 self-start">
            <div className="hidden lg:block col-span-1 sticky top-20 self-start space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Tags className="mr-2 h-4 w-4" />
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Sustainability</Badge>
                    <Badge variant="secondary">Tree Care</Badge>
                    <Badge variant="secondary">Environment</Badge>
                    <Badge variant="secondary">Conservation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
