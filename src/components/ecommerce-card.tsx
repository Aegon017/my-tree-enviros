import { Markup } from "interweave";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import RatingStars from "./rating-stars";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Product } from "@/types/product";

interface Props {
  product: Product;
}

export function EcommerceCard({ product }: Props) {
  const {
    id,
    category,
    name,
    description,
    price,
    discount_price,
    thumbnail_url,
    reviews,
    has_variants,
  } = product;

  const discountPercentage = useMemo(
    () =>
      discount_price && discount_price < price
        ? Math.round(((price - discount_price) / price) * 100)
        : 0,
    [price, discount_price],
  );

  const averageRating = useMemo(
    () =>
      reviews?.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    [reviews],
  );

  const displayPrice =
    discount_price && discount_price < price ? discount_price : price;
  const hasDiscount = discount_price && discount_price < price;

  return (
    <div className="group bg-background rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <div className="relative h-48 bg-muted/50 overflow-hidden">
        <Link
          href={`/store/products/${id}`}
          className="block h-full w-full relative"
        >
          <Image
            src={thumbnail_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {discountPercentage > 0 && (
          <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {category.name}
        </div>

        <Link href={`/store/products/${id}`} className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
              {name}
            </h3>
            <RatingStars
              rating={averageRating}
              size="md"
              showCount
              reviewCount={reviews?.length || 0}
            />
          </div>
          <Markup
            className="text-sm text-muted-foreground mb-4 line-clamp-2"
            content={description}
          />
        </Link>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-foreground">
            ₹{displayPrice}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{price}
            </span>
          )}
        </div>

        {has_variants && (
          <div className="mb-4">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Multiple options available
            </span>
          </div>
        )}

        <Link href={`/store/products/${id}`} className="block">
          <Button className="w-full">View Product</Button>
        </Link>
      </div>
    </div>
  );
}
