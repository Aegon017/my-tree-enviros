"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { MapPin } from "lucide-react";
import BasicTreeCard from "@/components/basic-tree-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import BasicTreeCardSkeleton from "@/components/skeletons/basic-tree-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location-search";
import { treeService } from "@/services/tree.service";
import type { BreadcrumbItemType } from "@/types/home";
import type { TreeListItem } from "@/types/tree.types";

const breadcrumbItems: BreadcrumbItemType[] = [
  { title: "Home", href: "/" },
  { title: "Adopt A Tree", href: "" },
];

const Page = () => {
  const { selectedLocation } = useLocation();
  const [ trees, setTrees ] = useState<TreeListItem[]>( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ error, setError ] = useState<Error | null>( null );
  const [ page, setPage ] = useState( 1 );
  const [ hasMore, setHasMore ] = useState( true );
  const initialLoadRef = useRef( false );
  const locationKeyRef = useRef<string>( "" );

  const getLocationKey = ( location: typeof selectedLocation ) => {
    if ( !location?.lat || !location?.lng ) return "";
    return `${ location.lat }-${ location.lng }`;
  };

  useEffect( () => {
    const fetchTrees = async () => {
      if ( !selectedLocation?.lat || !selectedLocation?.lng ) {
        setTrees( [] );
        setPage( 1 );
        setHasMore( false );
        initialLoadRef.current = false;
        locationKeyRef.current = "";
        return;
      }

      const currentLocationKey = getLocationKey( selectedLocation );

      if ( !initialLoadRef.current || locationKeyRef.current !== currentLocationKey ) {
        initialLoadRef.current = true;
        locationKeyRef.current = currentLocationKey;
        setPage( 1 );
        setHasMore( true );
      }

      if ( page === 1 && locationKeyRef.current !== currentLocationKey ) return;

      setIsLoading( true );
      setError( null );

      try {
        const response = await treeService.getTrees( {
          user_lat: selectedLocation.lat,
          user_lng: selectedLocation.lng,
          radius_km: 50,
          page,
          per_page: 20,
          type: 'adopt'
        } );

        if ( response.success ) {
          const newTrees = response.data.trees || [];

          if ( page === 1 ) {
            setTrees( newTrees );
          } else {
            setTrees( ( prev ) => [ ...prev, ...newTrees ] );
          }

          const meta = response.data.meta;
          setHasMore( meta.current_page < meta.last_page );
        }
      } catch ( err ) {
        setError( err as Error );
      } finally {
        setIsLoading( false );
      }
    };

    fetchTrees();
  }, [ selectedLocation, page ] );

  const handleLoadMore = () => {
    setPage( ( prev ) => prev + 1 );
  };

  if ( error ) {
    return (
      <div className="container max-w-6xl mx-auto">
        <BreadcrumbNav items={ breadcrumbItems } className="mb-6 py-4 px-4" />
        <Section className="bg-background py-12">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load trees. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={ () => window.location.reload() }>Try Again</Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto">
      <BreadcrumbNav items={ breadcrumbItems } className="mb-6 py-4 px-4" />

      <Section className="bg-background py-12">
        <SectionTitle
          title="Adopt A Tree"
          subtitle="Adopting a tree supports sustainability, biodiversity, and climate action."
          align="center"
        />

        { selectedLocation && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Showing trees near{ " " }
              <strong>
                { selectedLocation.area }, { selectedLocation.city }
              </strong>
            </span>
          </div>
        ) }

        { !selectedLocation?.lat ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Please select your location to view available trees.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center gap-6">
              { isLoading && page === 1
                ? Array.from( { length: 10 } ).map( ( _, i ) => (
                  <BasicTreeCardSkeleton key={ i } />
                ) )
                : trees.map( ( tree ) => (
                  <Link
                    key={ tree.id }
                    href={ `/adopt-a-tree/${ tree.slug }` }
                    className="transition-transform hover:scale-105"
                  >
                    <BasicTreeCard
                      name={ tree.name }
                      image={ tree.thumbnail_url }
                    />
                  </Link>
                ) ) }
            </div>

            { !isLoading && trees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No trees available near{ " " }
                  <strong>
                    { selectedLocation.area }, { selectedLocation.city }
                  </strong>
                </p>
              </div>
            ) }

            { hasMore && trees.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  onClick={ handleLoadMore }
                  disabled={ isLoading }
                  variant="outline"
                >
                  { isLoading ? "Loading..." : "Load More" }
                </Button>
              </div>
            ) }
          </>
        ) }
      </Section>
    </div>
  );
};

export default Page;