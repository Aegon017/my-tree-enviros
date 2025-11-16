"use client";

import { use } from "react";
import useSWR from "swr";
import TreeDetailsLayout from "@/components/tree-details-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { treeService } from "@/services/tree.service";

const fetcher = async ( url: string ) => {
  const slug = String( url.split( '/' ).pop() );
  const response = await treeService.getTree( slug );
  return response;
};

export default function Page( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = use( params );

  const {
    data: response,
    error,
    isLoading,
  } = useSWR( slug ? `/trees/${ slug }?type=adopt` : null, fetcher, { revalidateOnFocus: false } );

  if ( error ) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh] bg-background">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Trees className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive">
              Error Loading Tree
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't load the tree details. Please try again later.
            </p>
            <Button onClick={ () => window.location.reload() } variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TreeDetailsLayout
      tree={ response?.data?.tree }
      isLoading={ isLoading }
      pageType="adopt"
    />
  );
}
