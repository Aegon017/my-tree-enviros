import { Product } from "@/types/product.types";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import RatingStars from "./rating-stars";
import { Button } from "./ui/button";

const ProductCard = ( { product }: { product: Product } ) => {
  const price = product.price || 0;
  const discount = product.discount_price ?? null;
  const finalPrice = discount && discount < price ? discount : price;
  const discountPercent = discount && discount < price ? Math.round( ( ( price - discount ) / price ) * 100 ) : 0;
  const img = product.thumbnail_url || product.image_urls?.[ 0 ] || "/placeholder.png";

  return (
    <Card className="group overflow-hidden h-full flex flex-col hover:shadow-lg transition py-0">
      <div className="relative h-48">
        <Link href={ `/store/products/${ product.id }` } className="block w-full h-full">
          <Image src={ img } alt={ product.name } fill className="object-cover group-hover:scale-105 transition" />
        </Link>
        { discountPercent > 0 && <Badge className="absolute top-2 left-2 bg-red-500">{ discountPercent }% OFF</Badge> }
      </div>

      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        { product.category?.name && (
          <div className="text-xs font-semibold text-muted-foreground uppercase">{ product.category.name }</div>
        ) }

        <Link href={ `/store/products/${ product.id }` } className="flex-1">
          <h3 className="font-semibold text-sm line-clamp-2">{ product.name }</h3>
          <RatingStars
            rating={ product.rating ?? 0 }
            showCount={ !!product.review_count }
            reviewCount={ product.review_count ?? 0 }
          />
          { product.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{ product.short_description }</p>
          ) }
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">₹{ finalPrice }</span>
          { discount && discount < price && (
            <span className="text-sm text-muted-foreground line-through">₹{ price }</span>
          ) }
        </div>

        { product.has_variants && <Badge variant="secondary" className="text-xs w-fit">Multiple options</Badge> }

        <Link href={ `/store/products/${ product.id }` } className="mt-auto">
          <Button className="w-full">View Product</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ProductCard;