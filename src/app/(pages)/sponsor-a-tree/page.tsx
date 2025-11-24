"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCard from "@/components/basic-tree-card";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTrees } from "@/hooks/use-trees";
import { useLocationStore } from "@/store/location-store";
import PaginationWrapper from "@/components/pagination-wrapper";

const breadcrumbItems = [
  { title: "Home", href: "/" },
  { title: "Sponsor A Tree", href: "" },
];

export default function Page() {
  const { selected } = useLocationStore();

  const { trees, meta, loading, error, loadList } = useTrees({
    type: "sponsor",
    lat: selected?.lat,
    lng: selected?.lng,
    page: 1,
    per_page: 20,
  });

  const handlePageChange = (page: number) => {
    loadList(
      {
        type: "sponsor",
        lat: selected?.lat,
        lng: selected?.lng,
        page,
        per_page: 20,
      },
      true,
    );
  };

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={breadcrumbItems} className="mb-6 py-4 px-4" />
        <Section className="bg-background py-12">
          <Alert variant="destructive">
            <AlertDescription>Failed to load trees.</AlertDescription>
          </Alert>
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
          subtitle="Sponsoring a tree helps support environmental conservation, biodiversity, and long-term sustainability."
          align="center"
        />

        {selected && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Showing trees near {selected.area}, {selected.city}
          </div>
        )}

        {!selected?.lat ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            Please select a location to view available trees
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-center">
              {loading && trees.length === 0
                ? Array.from({ length: 10 }).map((_, i) => (
                    <BasicTreeCardSkeleton key={i} />
                  ))
                : trees.map((tree) => (
                    <Link
                      key={tree.id}
                      href={`/sponsor-a-tree/${tree.slug}`}
                      className="transition-transform hover:scale-105"
                    >
                      <BasicTreeCard
                        name={tree.name}
                        image={tree.thumbnail_url}
                      />
                    </Link>
                  ))}
            </div>

            {!loading && trees.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No sponsored trees available near {selected.area},{" "}
                {selected.city}
              </div>
            )}

            {meta && meta.last_page > 1 && (
              <div className="flex justify-center mt-10">
                <PaginationWrapper
                  meta={meta}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
