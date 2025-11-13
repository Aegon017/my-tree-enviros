import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { WishlistItem } from "@/types/wishlist";
import Link from "next/link";

interface Props {
  item: WishlistItem;
  isAuthenticated: boolean;
  onRemove: ( id: number ) => void;
  onMoveToCart: ( id: number ) => void;
  onAddToCart: ( item: WishlistItem ) => void;
  removingIds: number[];
  addingToCartIds: number[];
}

const WishlistItemCard: React.FC<Props> = ( {
  item,
  isAuthenticated,
  onRemove,
  onMoveToCart,
  onAddToCart,
  removingIds,
  addingToCartIds,
} ) => {
  const isRemoving = removingIds.includes( item.id );
  const isAddingToCart = addingToCartIds.includes( item.id );

  const product = item.product;
  const variant = item.variant;

  const imageUrl =
    variant?.image_urls?.[ 0 ]?.url || product?.category?.image_url || null;

  const isAvailable = variant?.is_instock ?? true;
  const price = variant?.selling_price ?? 0;

  return (
    <Card className="overflow-hidden p-0 gap-0 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          { imageUrl ? (
            <Image
              src={ imageUrl }
              alt={ product?.name }
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
          ) }

          { !isAvailable && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          ) }
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            <Link href={ `/store/products/${ product?.slug }` }>{ product?.name }</Link>
          </h3>

          {/* ✅ Variant Info Block (from your design) */ }
          { variant && (
            <div className="bg-muted/50 p-3 rounded-md border border-border mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    { variant.variant?.name || "Default Variant" }
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    { variant.variant?.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={ {
                          backgroundColor:
                            variant.variant.color.code || "transparent",
                        } }
                        title={ variant.variant.color.name }
                      />
                    ) }

                    { variant.variant?.size?.name && (
                      <span className="px-2 py-0.5 rounded-md bg-background border text-xs font-medium">
                        { variant.variant.size.name }
                      </span>
                    ) }

                    { variant.variant?.planter?.name && (
                      <span className="text-xs font-medium text-foreground">
                        { variant.variant.planter.name }
                      </span>
                    ) }

                    { !variant.variant?.color &&
                      !variant.variant?.size &&
                      !variant.variant?.planter && (
                        <span className="px-2 py-0.5 rounded-md border border-dashed text-muted-foreground text-xs bg-background/60">
                          Standard Variant
                        </span>
                      ) }
                  </div>
                </div>

                <div
                  className={ `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border ${ variant.is_instock
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }` }
                >
                  <div
                    className={ `w-2 h-2 rounded-full ${ variant.is_instock ? "bg-primary" : "bg-destructive"
                      }` }
                  />
                  { variant.is_instock ? (
                    <span>In Stock ({ variant.stock_quantity })</span>
                  ) : (
                    <span>Out of Stock</span>
                  ) }
                </div>
              </div>
            </div>
          ) }
        </div>

        {/* ✅ Price */ }
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{ price }</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        { isAuthenticated ? (
          <Button
            className="flex-1"
            onClick={ () => onMoveToCart( item.id ) }
            disabled={ !isAvailable || isAddingToCart }
          >
            { isAddingToCart ? (
              "Adding..."
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Move to Cart
              </>
            ) }
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={ () => onAddToCart( item ) }
            disabled={ !isAvailable }
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        ) }

        <Button
          variant="destructive"
          size="icon"
          onClick={ () => onRemove( item.id ) }
          disabled={ isRemoving }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItemCard;