"use client";

import { use } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import TreeDetailsLayout from "@/components/tree-details-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Trees } from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface Props {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: Props) {
  const { id } = use(params);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(id ? `/trees/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  if (error) {
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
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TreeDetailsLayout
      tree={response?.data?.tree}
      isLoading={isLoading}
      pageType="sponsor"
    />
  );
}
