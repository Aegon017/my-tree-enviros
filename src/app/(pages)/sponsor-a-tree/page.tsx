"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import BasicTreeCard from "@/components/basic-tree-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { treeService } from "@/services/tree.service";
import type { BreadcrumbItemType } from "@/types/home";
import type { Tree } from "@/types/tree";

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Sponsor A Tree", href: "" },
];

const Page = () => {
  const { selectedLocation } = useLocation();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTrees = async () => {
      if (!selectedLocation) {
        setTrees([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await treeService.getSponsorship({
          location_id: selectedLocation.id,
          page,
          per_page: 20,
        });

        if (response.success) {
          if (page === 1) {
            setTrees(response.data.trees);
          } else {
            setTrees((prev) => [...prev, ...response.data.trees]);
          }

          setHasMore(
            response.data.meta.current_page < response.data.meta.last_page,
          );
        }
      } catch (err) {
        console.error("Failed to fetch trees:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrees();
  }, [selectedLocation, page]);

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
              Failed to load trees. Please try again later.
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
          title="Sponsor A Tree"
          subtitle="Sponsoring a tree is more than just planting—it's a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity."
          align="center"
        />
        {selectedLocation && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Showing trees in <strong>{selectedLocation.name}</strong>
            </span>
          </div>
        )}

        {!selectedLocation ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Please select a location to view available trees
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center gap-6">
              {isLoading && page === 1
                ? Array.from({ length: 10 }).map((_, i) => (
                    <BasicTreeCardSkeleton
                      key={`skeleton-${Date.now()}-${i}`}
                    />
                  ))
                : trees.map((tree) => (
                    <Link
                      key={tree.id}
                      href={`/sponsor-a-tree/${tree.id}`}
                      className="transition-transform hover:scale-105"
                    >
                      <BasicTreeCard
                        name={tree.name}
                        image={tree.main_image_url}
                      />
                    </Link>
                  ))}
            </div>

            {trees.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No trees available for sponsorship in {selectedLocation.name}
                </p>
              </div>
            )}

            {hasMore && trees.length > 0 && (
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
          </>
        )}
      </Section>
    </div>
  );
};

export default Page;
