import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

const WishlistItemCardSkeleton = () => (
  <Card className="flex flex-col animate-pulse">
    <CardHeader className="flex-grow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-32"></div>
          </div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
        <div className="h-6 bg-muted rounded w-16"></div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
      <div className="relative mt-4 aspect-video bg-muted rounded-lg"></div>
    </CardContent>
    <CardFooter className="flex flex-col gap-2">
      <div className="h-10 bg-muted rounded w-full"></div>
      <div className="h-10 bg-muted rounded w-full"></div>
    </CardFooter>
  </Card>
);

export default WishlistItemCardSkeleton;
