import { Markup } from "interweave";
import { Check, Leaf, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/types/cart.type";
import type { WishlistItem } from "@/types/wishlist";
import RatingStars from "./rating-stars";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface WishlistItemCardProps {
  wishlistItem: WishlistItem;
  removingIds: number[];
  addingToCartIds: number[];
  cartItems: CartItem[];
  onRemove: (productId: number) => void;
  onAddToCart: (
    productId: number,
    productType: number,
    productName: string,
  ) => void;
}

const WishlistItemCard = ({
  wishlistItem,
  removingIds,
  addingToCartIds,
  cartItems,
  onRemove,
  onAddToCart,
}: WishlistItemCardProps) => {
  const isRemoving = removingIds.includes(wishlistItem.product.id);
  const isAddingToCart = addingToCartIds.includes(wishlistItem.product.id);
  const product = wishlistItem.product;
  const isInCart = cartItems.some((item) => item.product_id === product.id);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              {product.name}
            </CardTitle>
            {product.botanical_name && (
              <CardDescription className="italic mt-1">
                {product.botanical_name}
              </CardDescription>
            )}
          </div>
          {product.price && (
            <div className="text-right">
              {product.discount_price &&
              product.discount_price < product.price ? (
                <>
                  <span className="font-semibold text-lg text-green-600">
                    ₹{product.discount_price}
                  </span>
                  <span className="text-sm text-muted-foreground line-through block">
                    ₹{product.price}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-lg text-green-600">
                  ₹{product.price}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {product.rating > 0 && (
          <div className="mb-3">
            <RatingStars
              rating={product.rating}
              size="sm"
              showCount
              reviewCount={product.review_count || 0}
            />
          </div>
        )}

        {product.description && (
          <Markup
            className="text-sm text-muted-foreground line-clamp-3"
            content={product.description}
          />
        )}
        {product.main_image_url && (
          <div className="relative mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Image
              src={product.main_image_url}
              alt={product.name}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          {product.quantity > 0 ? (
            <span className="text-sm text-green-600">In Stock</span>
          ) : (
            <span className="text-sm text-destructive">Out of Stock</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {isInCart ? (
          <>
            <Button className="w-full" variant="outline" disabled>
              <Check className="h-4 w-4 mr-2" />
              Added in Cart
            </Button>
            <Link href="/cart" className="w-full">
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart
              </Button>
            </Link>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={() => onAddToCart(product.id, product.type, product.name)}
            disabled={isAddingToCart || product.quantity === 0}
          >
            {isAddingToCart ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground mr-2" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onRemove(product.id)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from Wishlist
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItemCard;
