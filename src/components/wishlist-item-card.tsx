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
  const {
    id,
    image_url: imageUrl,
    name,
    price,
    quantity
  } = item;

  const isRemoving = removingIds.includes( id );
  const isAddingToCart = addingToCartIds.includes( id );
  const isAvailable = quantity > 0;

  return (
    <Card className="overflow-hidden p-0 gap-0 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          { imageUrl ? (
            <Image
              src={ imageUrl }
              alt={ name }
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

      <CardContent className="p-4 flex-1">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2"><Link href={ `/store/products` }>{ name }</Link></h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{ price }</span>
          {/* <Badge variant="outline">{ variant_name }</Badge> */}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        { isAuthenticated ? (
          <Button
            className="flex-1"
            onClick={ () => onMoveToCart( id ) }
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
          onClick={ () => onRemove( id ) }
          disabled={ isRemoving }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItemCard;