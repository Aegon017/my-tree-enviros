import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BlogCardSkeleton = () => {
  return (
    <Card className="w-full max-w-md overflow-hidden bg-background border-border shadow-sm rounded-xl py-0 ml-4">
      <div className="relative w-full overflow-hidden aspect-video">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      <CardContent className="p-4 pb-5 space-y-3">
        <Skeleton className="h-6 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-5/6 rounded-sm" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20 rounded-sm" />
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCardSkeleton;
