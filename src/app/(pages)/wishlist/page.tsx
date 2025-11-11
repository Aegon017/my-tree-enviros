"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import WishlistItemCardSkeleton from "@/components/skeletons/wishlist-item-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { wishlistService, type WishlistItem } from "@/services/wishlist.service";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

type WishlistItemType = WishlistItem;

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const [ wishlistItems, setWishlistItems ] = useState<WishlistItemType[]>( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ removingIds, setRemovingIds ] = useState<number[]>( [] );
  const [ addingToCartIds, setAddingToCartIds ] = useState<number[]>( [] );
  const { addToCart } = useCart();

  useEffect( () => {
    const fetchWishlist = async () => {
      setIsLoading( true );
      try {
        const response = await wishlistService.getWishlist();
        if ( response.success ) setWishlistItems( response.data.wishlist.items || [] );
      } finally {
        setIsLoading( false );
      }
    };
    fetchWishlist();
  }, [ isAuthenticated ] );


  const handleRemove = async ( id: number ) => {
    setRemovingIds( ( p ) => [ ...p, id ] );
    try {
      const res = await wishlistService.removeFromWishlist( id );
      if ( res.success ) setWishlistItems( ( p ) => p.filter( ( i ) => i.id !== id ) );
      toast.success( "Removed" );
    } finally {
      setRemovingIds( ( p ) => p.filter( ( x ) => x !== id ) );
    }
  };

  const handleAddToCart = ( item: WishlistItemType ) => {
    addToCart( {
      id: item.product.id,
      name: item.product.name,
      price: item.product.selling_price,
      quantity: 1,
      image: item.product.thumbnail_url,
      type: "product",
    } as any );
    const updated = wishlistItems.filter( ( i ) => i.id !== item.id );
    setWishlistItems( updated );
    localStorage.setItem( "guest_wishlist", JSON.stringify( updated ) );
    toast.success( "Added to cart" );
  };

  const handleMoveToCart = async ( id: number ) => {
    setAddingToCartIds( ( p ) => [ ...p, id ] );
    try {
      const res = await wishlistService.moveToCart( id );
      if ( res.success ) {
        setWishlistItems( ( p ) => p.filter( ( i ) => i.id !== id ) );
        toast.success( "Moved to cart" );
      }
    } finally {
      setAddingToCartIds( ( p ) => p.filter( ( x ) => x !== id ) );
    }
  };

  const handleClear = async () => {
    const res = await wishlistService.clearWishlist();
    if ( !res.success ) return;
    setWishlistItems( [] );
    toast.success( "Cleared" );
  };

  if ( isLoading )
    return (
      <Section>
        <SectionTitle align="center" title="Wishlist" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          { Array.from( { length: 6 } ).map( ( _, i ) => (
            <WishlistItemCardSkeleton key={ i } />
          ) ) }
        </div>
      </Section>
    );

  if ( wishlistItems.length === 0 )
    return (
      <Section>
        <SectionTitle align="center" title="Wishlist" />
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <div className="flex gap-4 justify-center">
            <Link href="/sponsor-a-tree"><Button>Browse Trees</Button></Link>
            <Link href="/store"><Button variant="outline">Browse Products</Button></Link>
          </div>
        </div>
      </Section>
    );

  return (
    <Section>
      <SectionTitle align="center" title="Wishlist" subtitle={ `You have ${ wishlistItems.length } item${ wishlistItems.length !== 1 ? "s" : "" }` } />
      <div className="flex justify-end mb-4">
        <Button variant="destructive" size="sm" onClick={ handleClear }>Clear All</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        { wishlistItems.map( ( item ) => {
          const image = item.image_url;
          const name = item.name;
          const price = item.price;
          const available = item.quantity > 0;
          const removing = removingIds.includes( item.id );
          const adding = addingToCartIds.includes( item.id );

          return (
            <Card key={ item.id } className="overflow-hidden p-0 gap-0">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  { image ? (
                    <Image src={ image } alt={ name } fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  ) }
                  { !available && <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge> }
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{ name }</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₹{ price }</span>
                  <Badge variant="outline">Product</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                { isAuthenticated ? (
                  <Button className="flex-1" onClick={ () => handleMoveToCart( item.id ) } disabled={ !available || adding }>
                    { adding ? "Adding..." : <><ShoppingCart className="h-4 w-4 mr-2" />Move to Cart</> }
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={ () => handleAddToCart( item ) } disabled={ !available }>
                    <ShoppingCart className="h-4 w-4 mr-2" />Add to Cart
                  </Button>
                ) }
                <Button variant="destructive" size="icon" onClick={ () => handleRemove( item.id ) } disabled={ removing }>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        } ) }
      </div>
    </Section>
  );
};

export default WishlistPage;
