"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FeedTreeCardSkeleton = () => {
    return (
        <Card className="overflow-hidden pt-0">
            <div className="relative h-48">
                <Skeleton className="h-full w-full" />
            </div>

            <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>

                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="flex justify-between text-xs">
                        <Skeleton className="h-3 w-1/5" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>

                <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
        </Card>
    );
};

export default FeedTreeCardSkeleton;