"use client";

import Link from "next/link";
import useSWR from "swr";
import BasicTreeCard from "@/components/basic-tree-card";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import { authStorage } from "@/lib/auth-storage";
import type { Tree } from "@/types/tree";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authStorage.getToken()}`,
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.data;
};

const Page = () => {
  const {
    data: trees,
    error,
    isLoading,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/adopt-trees`,
    fetcher,
  );

  if (isLoading) {
    return (
      <Section className="bg-background py-12">
        <SectionTitle
          title="Adopt A Tree"
          subtitle="Loading available trees..."
          align="center"
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center gap-6">
          {[...Array(10)].map((_, i) => (
            <BasicTreeCardSkeleton key={i} />
          ))}
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="bg-background py-12">
        <SectionTitle
          title="Adopt A Tree"
          subtitle="Error loading trees. Please try again later."
          align="center"
        />
      </Section>
    );
  }

  return (
    <Section className="bg-background py-12">
      <SectionTitle
        title="Adopt A Tree"
        subtitle="Adopting a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity. Trees not only beautify our surroundings but also play a vital role in combating climate change and supporting wildlife habitats."
        align="center"
      />

      {trees.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No trees available for adoption at the moment.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center gap-6">
          {trees.map((tree: Tree) => (
            <Link
              key={tree.id}
              href={`/adopt-a-tree/${tree.id}`}
              className="transition-transform hover:scale-105"
            >
              <BasicTreeCard
                name={tree.name}
                image={tree.main_image_url || "/placeholder.svg"}
              />
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
};

export default Page;
