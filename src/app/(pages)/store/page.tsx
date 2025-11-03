"use client";

import { useEffect, useState } from "react";
import { EcommerceCard } from "@/components/ecommerce-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import EcommerceCardSkeleton from "@/components/skeletons/ecommerce-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import type { BreadcrumbItemType } from "@/types/home";
import type { Product } from "@/services/product.service";

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Store", href: "" },
];

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productService.getAll({
          page,
          per_page: 12,
        });

        if (response.success) {
          if (page === 1) {
            setProducts(response.data.data);
          } else {
            setProducts((prev) => [...prev, ...response.data.data]);
          }

          setHasMore(
            response.data.meta.current_page < response.data.meta.last_page,
          );
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  console.log("Products:", products);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
        <Section className="bg-background py-12">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load products. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto">
      <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
      <Section className="bg-background py-12">
        <SectionTitle
          title="Natural Goodness from Trees"
          subtitle="Discover a wide range of organic products derived directly from nature's bounty. From nourishing oils to flavorful spices and eco-friendly raw materials."
          align="center"
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {isLoading && page === 1
            ? Array.from({ length: 6 }).map((_, i) => (
                <EcommerceCardSkeleton key={`product-${Date.now()}-${i}`} />
              ))
            : products?.map((product: Product) => (
                <EcommerceCard key={product.id} product={product} />
              ))}
        </div>

        {products?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No products available at the moment.
            </p>
          </div>
        )}

        {hasMore && products.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </Section>
    </div>
  );
};

export default Page;
