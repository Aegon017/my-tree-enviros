import { Product } from "@/types/product.types"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "./ui/badge"
import RatingStars from "./rating-stars"
import { Button } from "./ui/button"

export default function ProductCard( { product }: { product: Product } ) {
  const price = product.selling_price || 0
  const original = product.original_price ?? null
  const discount = original && original > price ? Math.round( ( ( original - price ) / original ) * 100 ) : 0
  const img = product.thumbnail_url || product.image_urls?.[ 0 ] || "/placeholder.png"

  return (
    <Card className="group flex flex-col py-0 gap-0 overflow-hidden bg-card border rounded-xl transition-shadow hover:shadow-md">
      <Link
        href={ `/store/products/${ product.slug }` }
        className="relative h-56 w-full overflow-hidden rounded-b-none"
      >
        <Image
          src={ img }
          alt={ product.name }
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        { discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white rounded-md">
            { discount }% OFF
          </Badge>
        ) }
      </Link>

      <CardContent className="flex flex-col p-4 gap-3 flex-1">
        { product.category?.name && (
          <Badge variant="outline" className="rounded text-[10px] uppercase tracking-wide w-fit">
            { product.category.name }
          </Badge>
        ) }

        <Link href={ `/store/products/${ product.slug }` } className="flex-1 space-y-1">
          <h3 className="font-semibold text-[15px] leading-tight line-clamp-2">{ product.name }</h3>

          <RatingStars
            rating={ product.rating ?? 0 }
            showCount
            reviewCount={ product.review_count ?? 0 }
          />

          { product.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              { product.short_description }
            </p>
          ) }
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">₹{ price }</span>
          { original && original > price && (
            <span className="text-sm text-muted-foreground line-through">₹{ original }</span>
          ) }
        </div>

        { product.has_variants && <Badge variant="secondary" className="rounded text-[10px]">Multiple Options</Badge> }

        <Link href={ `/store/products/${ product.slug }` } className="mt-auto">
          <Button className="w-full rounded-md">View Product</Button>
        </Link>
      </CardContent>
    </Card>
  )
}