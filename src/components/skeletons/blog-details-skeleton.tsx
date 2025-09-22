"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BlogDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <Skeleton className="h-6 w-48 rounded mb-6" />
      </div>
      <div className="container max-w-6xl mx-auto px-4 pb-8 animate-pulse">
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 lg:col-span-4">
            <article className="bg-card rounded-xl border overflow-hidden">
              <Skeleton className="relative h-64 sm:h-80 md:h-96 rounded-t-xl" />

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <Skeleton className="h-4 w-24 rounded" />
                  <div className="h-1 w-1 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>

                <Skeleton className="h-10 w-3/4 rounded" />

                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-4/6 rounded" />
                </div>

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Skeleton className="h-6 w-32 rounded" />

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" disabled className="rounded-full p-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </Button>
                      <Button variant="outline" size="icon" disabled className="rounded-full p-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </Button>
                      <Button variant="outline" size="icon" disabled className="rounded-full p-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </Button>
                      <Button variant="outline" size="icon" disabled className="rounded-full p-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="hidden lg:block col-span-1 sticky top-20 self-start space-y-6">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}