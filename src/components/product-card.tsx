import { ProductListItem } from "@/types/product.types";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import RatingStars from "./rating-stars";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const price = product.selling_price || 0;
  const original = product.original_price ?? null;

  const discount =
    original && original > price
      ? Math.round(((original - price) / original) * 100)
      : 0;

  const img = product.thumbnail_url || "/placeholder.svg";

  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl bg-card transition-shadow hover:shadow-md py-0 gap-0">
      <Link
        href={`/store/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden sm:aspect-4/5"
      >
        <Image
          src={img}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {discount > 0 && (
          <Badge className="absolute top-2 left-2 rounded-md bg-red-500 text-white">
            {discount}% OFF
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-col gap-3 p-4 flex-1">
        {product.category?.name && (
          <Badge
            variant="outline"
            className="w-fit rounded-md text-[10px] uppercase tracking-wide"
          >
            {product.category.name}
          </Badge>
        )}

        <Link
          href={`/store/products/${product.slug}`}
          className="flex flex-col gap-1 flex-1"
        >
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight sm:text-[15px]">
            {product.name}
          </h3>

          <RatingStars
            rating={product.rating ?? 0}
            showCount
            reviewCount={product.review_count ?? 0}
          />

          {product.short_description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {product.short_description}
            </p>
          )}
        </Link>

        {/* PRICE */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            {product.has_variants && "From: "}₹{price}
          </span>

          {original && original > price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{original}
            </span>
          )}
        </div>

        {product.has_variants && (
          <Badge variant="secondary" className="rounded-md text-[10px]">
            Multiple Options
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}