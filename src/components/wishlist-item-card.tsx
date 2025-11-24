import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { WishlistItem } from "@/types/wishlist";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  item: WishlistItem;
  isAuthenticated: boolean;
  onRemove: (id: number) => void;
  onMoveToCart: (id: number) => void;
  removingIds: number[];
  addingToCartIds: number[];
}

const WishlistItemCard: React.FC<Props> = ({
  item,
  onRemove,
  onMoveToCart,
  removingIds,
  addingToCartIds,
}) => {
  const isRemoving = removingIds.includes(item.id);
  const isAddingToCart = addingToCartIds.includes(item.id);

  const { product, variant } = item;

  const imageUrl =
    variant?.image_urls?.[0]?.url || product?.category?.image_url || null;

  const isAvailable = variant?.is_instock ?? true;
  const price = variant?.selling_price ?? 0;

  return (
    <Card className="overflow-hidden p-0 flex flex-col gap-0">
      <CardHeader className="p-0 gap-0">
        <div className="relative h-60">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product?.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {!isAvailable && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            <Link href={`/store/products/${product?.slug}`}>
              {product?.name}
            </Link>
          </h3>
          {variant && (
            <div className="bg-muted/40 p-2 rounded-md border border-border/40 mt-2">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {variant.variant?.color && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-border/60"
                      style={{
                        backgroundColor:
                          variant.variant.color.code || "transparent",
                      }}
                      title={variant.variant.color.name}
                    />
                  )}

                  {variant.variant?.size?.name && (
                    <span className="px-1.5 py-0.5 rounded bg-background border text-[11px] font-medium">
                      {variant.variant.size.name}
                    </span>
                  )}

                  {variant.variant?.planter?.name && (
                    <span className="text-[11px] font-medium text-foreground px-1.5 py-0.5 bg-background rounded border">
                      {variant.variant.planter.name}
                    </span>
                  )}

                  {!variant.variant?.color &&
                    !variant.variant?.size &&
                    !variant.variant?.planter && (
                      <span className="px-1.5 py-0.5 rounded border text-[11px] bg-background/70 text-muted-foreground">
                        Standard Variant
                      </span>
                    )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border",
                    variant.is_instock
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-destructive/10 text-destructive border-destructive/20",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      variant.is_instock ? "bg-primary" : "bg-destructive",
                    )}
                  />
                  {variant.is_instock ? (
                    <span>In Stock ({variant.stock_quantity})</span>
                  ) : (
                    <span>Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{price}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onMoveToCart(item.id)}
          disabled={!isAvailable || isAddingToCart}
          loading={isAddingToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Move to cart
        </Button>

        <Button
          variant="ghost"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          loading={isRemoving}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItemCard;
