"use client";

import useSWR from "swr";
import { EcommerceCard } from "@/components/ecommerce-card";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import EcommerceCardSkeleton from "@/components/skeletons/ecommerce-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authStorage } from "@/lib/auth-storage";
import type { Product } from "@/types/product";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authStorage.getToken()}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const Page = () => {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`,
    fetcher,
  );

  const products = data?.data?.data;

  if (error) {
    return (
      <Section className="bg-background py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load products. Please try again later.
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  return (
    <Section className="bg-background py-12">
      <SectionTitle
        title="Natural Goodness from Trees"
        subtitle="Discover a wide range of organic products derived directly from nature's bounty. From nourishing oils to flavorful spices and eco-friendly raw materials."
        align="center"
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <EcommerceCardSkeleton key={`product-${Date.now()}-${i}`} />
            ))
          : products?.map((product: Product) => (
              <EcommerceCard key={product.id} product={product} />
            ))}
      </div>
    </Section>
  );
};

export default Page;
