import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { storage } from "@/lib/storage";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Props {
  product: Product;
}

const EcommerceCard = ( { product }: Props ) => {
  const { id, category, name, description, price, discount_price, main_image_url, reviews, wishlist_tag } = product;
  const [ isFavorite, setIsFavorite ] = useState( wishlist_tag );
  const [ isAddingToCart, setIsAddingToCart ] = useState( false );

  useEffect( () => {
    setIsFavorite( wishlist_tag );
  }, [ wishlist_tag ] );

  const discountPercentage = useMemo( () =>
    discount_price && discount_price < price
      ? Math.round( ( ( price - discount_price ) / price ) * 100 )
      : 0,
    [ price, discount_price ]
  );

  const averageRating = useMemo( () =>
    reviews?.length ? reviews.reduce( ( sum, r ) => sum + r.rating, 0 ) / reviews.length : 0,
    [ reviews ]
  );

  const handleToggleFavorite = useCallback( async () => {
    const newStatus = !isFavorite;
    setIsFavorite( newStatus );

    try {
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/wishlist/${ newStatus ? "add" : "remove" }/${ id }`,
        {
          method: newStatus ? "POST" : "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${ storage.getToken() }`,
          },
        }
      );

      if ( !response.ok ) throw new Error( "Network error" );

      toast.success( newStatus
        ? `Added ${ name } to your wishlist`
        : `Removed ${ name } from your wishlist`
      );
    } catch ( err ) {
      setIsFavorite( !newStatus );
      toast.error( "Failed to update wishlist" );
    }
  }, [ isFavorite, id, name ] );

  const handleAddToCart = useCallback( async ( e: React.MouseEvent ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart( true );

    try {
      await new Promise( resolve => setTimeout( resolve, 500 ) );
      toast.success( `${ name } has been added to your cart` );
    } catch ( err ) {
      toast.error( "Failed to add item to cart" );
    } finally {
      setIsAddingToCart( false );
    }
  }, [ name ] );

  const renderRatingStars = useCallback( ( rating: number ) => {
    return Array.from( { length: 5 }, ( _, index ) => {
      const starValue = index + 1;
      return (
        <Star
          key={ index }
          className={ `w-4 h-4 ${ starValue <= Math.floor( rating )
            ? "fill-primary text-primary"
            : starValue - 0.5 <= rating
              ? "fill-muted/50 text-muted"
              : "text-muted-foreground/30"
            }` }
        />
      );
    } );
  }, [] );

  return (
    <div className="group bg-background rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <div className="relative h-48 bg-muted/50 overflow-hidden">
        <Link href={ `/shop/products/${ id }` } className="block h-full w-full">
          <div className="relative h-48">
            <Image
              src={ main_image_url }
              alt={ name }
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-300 group-hover:scale-105"
            />
          </div>
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
                onClick={ ( e ) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite();
                } }
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

        <Link href={ `/shop/products/${ id }` } className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
              { name }
            </h3>
            <div className="flex items-center ml-2 shrink-0">
              { renderRatingStars( averageRating ) }
              <span className="ml-1 text-xs text-muted-foreground">({ reviews?.length || 0 })</span>
            </div>
          </div>

          <div
            className="text-sm text-muted-foreground mb-4 line-clamp-2 prose prose-sm prose-muted"
            dangerouslySetInnerHTML={ { __html: description } }
          />
        </Link>

        <div className="flex items-baseline mb-4">
          { discount_price && discount_price < price ? (
            <>
              <span className="text-xl font-bold text-foreground">₹{ discount_price }</span>
              <span className="text-sm text-muted-foreground line-through ml-2">₹{ price }</span>
            </>
          ) : (
            <span className="text-xl font-bold text-foreground">₹{ price }</span>
          ) }
        </div>

        <div className="flex gap-2 mt-auto">
          <Button
            className="flex-1"
            onClick={ handleAddToCart }
            disabled={ isAddingToCart }
          >
            { isAddingToCart ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            ) }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EcommerceCard;