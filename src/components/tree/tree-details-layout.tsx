"use client";

import BreadcrumbNav from "@/components/breadcrumb-nav";
import TreeContributionForm from "./tree-contribution-form";
import TreeTabs from "./tree-tabs";
import type { Tree } from "@/types/tree.types";
import ImageGallery from "../image-gallery";

interface Props {
  tree: Tree | null | undefined;
  isLoading: boolean;
  pageType: "sponsor" | "adopt";
}

export default function TreeDetailsLayout({
  tree,
  isLoading,
  pageType,
}: Props) {
  if (isLoading || !tree) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="w-full h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav
        items={[
          { title: "Home", href: "/" },
          {
            title: pageType === "sponsor" ? "Sponsor A Tree" : "Adopt A Tree",
            href: `/${pageType}-a-tree`,
          },
          { title: tree.name, href: "" },
        ]}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 lg:sticky top-24 self-start">
          <ImageGallery images={tree.image_urls || []} name={tree.name} />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md px-2 py-1 border">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 2v20" />
              </svg>
              <span className="text-sm">{tree.age ?? 0} years old</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight">{tree.name}</h1>
          </div>

          <TreeContributionForm tree={tree} pageType={pageType} />
        </div>
      </div>

      <div className="mt-16">
        <TreeTabs description={tree.description} />
      </div>
    </div>
  );
}
