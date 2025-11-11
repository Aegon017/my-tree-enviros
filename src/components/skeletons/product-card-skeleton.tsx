import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const ProductCardSkeleton = () => (
  <Card className="py-0">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default ProductCardSkeleton;