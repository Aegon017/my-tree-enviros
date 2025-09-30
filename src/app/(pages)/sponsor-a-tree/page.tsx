"use client";

import Link from "next/link";
import useSWR from "swr";
import BasicTreeCard from "@/components/basic-tree-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import type { BreadcrumbItemType } from "@/types/home";
import type { Tree } from "@/types/tree";

interface TreeApiResponse {
  status: boolean;
  message: string;
  data: Tree[];
}

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Sponsor A Tree", href: "" },
];

const treesFetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${storage.getToken()}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch trees");
  return res.json();
};

const Page = () => {
  const {
    data: treesData,
    error: treesError,
    isLoading: treesLoading,
  } = useSWR<TreeApiResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/trees`,
    treesFetcher,
  );

  const trees = treesData?.data ?? [];

  if (treesError) {
    return (
      <Section className="bg-background py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load trees. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Section>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto">
      <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
      <Section className="bg-background py-12">
        <SectionTitle
          title="Sponsor A Tree"
          subtitle="Sponsoring a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity."
          align="center"
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center gap-6">
          {treesLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <BasicTreeCardSkeleton key={`skeleton-${Date.now()}-${i}`} />
              ))
            : trees.map((tree) => (
                <Link
                  key={tree.id}
                  href={`/sponsor-a-tree/${tree.id}`}
                  className="transition-transform hover:scale-105"
                >
                  <BasicTreeCard name={tree.name} image={tree.main_image_url} />
                </Link>
              ))}
        </div>
      </Section>
    </div>
  );
};

export default Page;
