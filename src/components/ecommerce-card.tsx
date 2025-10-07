import { Markup } from "interweave";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { CheckoutType } from "@/enums/checkout.enum";
import { ProductType } from "@/enums/product.enum";
import api from "@/lib/axios";
import type { Product } from "@/types/product";
import AddToCartButton from "./add-to-cart-button";
import RatingStars from "./rating-stars";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Props {
  product: Product;
}

const wishlistMutation = async ( url: string, { arg }: { arg: { productId: number } } ) => {
  const response = await api[ url.includes( 'add' ) ? 'post' : 'delete' ]( url, arg );
  return response.data;
};

export function EcommerceCard( { product }: Props ) {
  const {
    id,
    category,
    name,
    description,
    price,
    discount_price,
    main_image_url,
    reviews,
    wishlist_tag,
  } = product;

  const [ isFavorite, setIsFavorite ] = useState( wishlist_tag );

  const { trigger: wishlistTrigger } = useSWRMutation(
    isFavorite ? "/wishlist/remove" : "/wishlist/add",
    wishlistMutation
  );

  const discountPercentage = useMemo( () =>
    discount_price && discount_price < price
      ? Math.round( ( ( price - discount_price ) / price ) * 100 )
      : 0,
    [ price, discount_price ]
  );

  const averageRating = useMemo( () =>
    reviews?.length
      ? reviews.reduce( ( sum, r ) => sum + r.rating, 0 ) / reviews.length
      : 0,
    [ reviews ]
  );

  const displayPrice = useMemo( () =>
    discount_price && discount_price < price ? discount_price : price,
    [ price, discount_price ]
  );

  const handleToggleFavorite = useCallback( async ( e: React.MouseEvent ) => {
    e.preventDefault();
    e.stopPropagation();

    const previousStatus = isFavorite;
    setIsFavorite( !isFavorite );

    try {
      await wishlistTrigger( { productId: id } );
      toast.success( `${ previousStatus ? 'Removed' : 'Added' } ${ name } ${ previousStatus ? 'from' : 'to' } your wishlist` );
    } catch {
      setIsFavorite( previousStatus );
      toast.error( "Failed to update wishlist" );
    }
  }, [ isFavorite, id, name, wishlistTrigger ] );

  return (
    <div className="group bg-background rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <div className="relative h-48 bg-muted/50 overflow-hidden">
        <Link href={ `/store/products/${ id }` } className="block h-full w-full relative">
          <Image
            src={ main_image_url }
            alt={ name }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        { discountPercentage > 0 && (
          <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary">
            { discountPercentage }% OFF
          </Badge>
        ) }

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className={ `absolute top-3 right-3 rounded-full transition-all duration-200 ${ isFavorite
                  ? "bg-destructive/20 text-destructive scale-110 hover:bg-destructive/30"
                  : "bg-background/80 text-muted-foreground hover:bg-background"
                  }` }
                onClick={ handleToggleFavorite }
              >
                <Heart className={ `w-4 h-4 ${ isFavorite ? "fill-current" : "" }` } />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{ isFavorite ? "Remove from wishlist" : "Add to wishlist" }</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          { category.name }
        </div>

        <Link href={ `/store/products/${ id }` } className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
              { name }
            </h3>
            <RatingStars
              rating={ averageRating }
              size="md"
              showCount
              reviewCount={ reviews?.length || 0 }
            />
          </div>
          <Markup
            className="text-sm text-muted-foreground mb-4 line-clamp-2"
            content={ description }
          />
        </Link>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-foreground">
            ₹{ displayPrice }
          </span>
          { Boolean( discount_price && (discount_price < price) ) && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{ price }
            </span>
          ) }
        </div>

        <AddToCartButton
          productId={ id }
          quantity={ 1 }
          productType={ ProductType.ECOMMERCE }
          cartType={ CheckoutType.CART }
        />
      </div>
    </div>
  );
}