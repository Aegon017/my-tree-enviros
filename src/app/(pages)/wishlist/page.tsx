"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import WishlistItemCardSkeleton from "@/components/skeletons/wishlist-item-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { wishlistService, type WishlistItem } from "@/services/wishlist.service";
import WishlistItemCard from "@/components/wishlist-item-card";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  removingIds: number[];
  addingToCartIds: number[];
}

const TOAST_MESSAGES = {
  REMOVED: "Removed from wishlist",
  MOVED_TO_CART: "Moved to cart",
  ADDED_TO_CART: "Added to cart",
  CLEARED: "Wishlist cleared",
  ERROR: "Something went wrong",
} as const;

const EMPTY_STATE_CONFIG = {
  icon: Heart,
  title: "Your wishlist is empty",
  actions: [
    { href: "/store", label: "Browse Products", variant: "outline" as const },
  ],
};

const useWishlist = () => {
  const [ state, setState ] = useState<WishlistState>( {
    items: [],
    isLoading: false,
    removingIds: [],
    addingToCartIds: [],
  } );

  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback( async () => {
    if ( !isAuthenticated ) return;

    setState( prev => ( { ...prev, isLoading: true } ) );

    try {
      const response = await wishlistService.getWishlist();
      if ( response.success ) {
        setState( prev => ( {
          ...prev,
          items: response.data.wishlist.items || [],
        } ) );
      }
    } catch ( error ) {
      console.error( "Failed to fetch wishlist:", error );
      toast.error( TOAST_MESSAGES.ERROR );
    } finally {
      setState( prev => ( { ...prev, isLoading: false } ) );
    }
  }, [ isAuthenticated ] );

  const removeItem = useCallback( async ( id: number ) => {
    setState( prev => ( { ...prev, removingIds: [ ...prev.removingIds, id ] } ) );

    try {
      const response = await wishlistService.removeFromWishlist( id );
      if ( response.success ) {
        setState( prev => ( {
          ...prev,
          items: prev.items.filter( item => item.id !== id ),
        } ) );
        toast.success( TOAST_MESSAGES.REMOVED );
      }
    } catch ( error ) {
      console.error( "Failed to remove item:", error );
      toast.error( TOAST_MESSAGES.ERROR );
    } finally {
      setState( prev => ( {
        ...prev,
        removingIds: prev.removingIds.filter( itemId => itemId !== id ),
      } ) );
    }
  }, [] );

  const moveToCart = useCallback( async ( id: number ) => {
    setState( prev => ( { ...prev, addingToCartIds: [ ...prev.addingToCartIds, id ] } ) );

    try {
      const response = await wishlistService.moveToCart( id );
      if ( response.success ) {
        setState( prev => ( {
          ...prev,
          items: prev.items.filter( item => item.id !== id ),
        } ) );
        toast.success( TOAST_MESSAGES.MOVED_TO_CART );
      }
    } catch ( error ) {
      console.error( "Failed to move item to cart:", error );
      toast.error( TOAST_MESSAGES.ERROR );
    } finally {
      setState( prev => ( {
        ...prev,
        addingToCartIds: prev.addingToCartIds.filter( itemId => itemId !== id ),
      } ) );
    }
  }, [] );

  const clearWishlist = useCallback( async () => {
    try {
      const response = await wishlistService.clearWishlist();
      if ( response.success ) {
        setState( prev => ( { ...prev, items: [] } ) );
        toast.success( TOAST_MESSAGES.CLEARED );
      }
    } catch ( error ) {
      console.error( "Failed to clear wishlist:", error );
      toast.error( TOAST_MESSAGES.ERROR );
    }
  }, [] );

  useEffect( () => {
    fetchWishlist();
  }, [ fetchWishlist ] );

  return {
    ...state,
    removeItem,
    moveToCart,
    clearWishlist,
  };
};

const EmptyWishlistState: React.FC = () => {
  const { icon: Icon, title, actions } = EMPTY_STATE_CONFIG;

  return (
    <div className="text-center">
      <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-4">{ title }</h3>
      <div className="flex gap-4 justify-center">
        { actions.map( ( action, index ) => (
          <Link key={ index } href={ action.href }>
            <Button variant={ action.variant }>{ action.label }</Button>
          </Link>
        ) ) }
      </div>
    </div>
  );
};

const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const {
    items: wishlistItems,
    isLoading,
    removingIds,
    addingToCartIds,
    removeItem,
    moveToCart,
    clearWishlist,
  } = useWishlist();

  const itemCountText = useMemo( () => {
    const count = wishlistItems.length;
    return `You have ${ count } item${ count !== 1 ? "s" : "" }`;
  }, [ wishlistItems.length ] );

  const handleAddToCart = useCallback( ( item: WishlistItem ) => {
    addToCart( {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image_url,
      type: "product",
    } );

    if ( !isAuthenticated ) {
      const updated = wishlistItems.filter( i => i.id !== item.id );
      localStorage.setItem( "guest_wishlist", JSON.stringify( updated ) );
    }

    toast.success( TOAST_MESSAGES.ADDED_TO_CART );
  }, [ addToCart, isAuthenticated, wishlistItems ] );

  if ( isLoading ) {
    return (
      <Section>
        <SectionTitle align="center" title="Wishlist" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          { Array.from( { length: 6 } ).map( ( _, index ) => (
            <WishlistItemCardSkeleton key={ index } />
          ) ) }
        </div>
      </Section>
    );
  }

  if ( wishlistItems.length === 0 ) {
    return (
      <Section>
        <SectionTitle align="center" title="Wishlist" />
        <EmptyWishlistState />
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        align="center"
        title="Wishlist"
        subtitle={ itemCountText }
      />

      <div className="flex justify-end mb-6">
        <Button
          variant="destructive"
          size="sm"
          onClick={ clearWishlist }
        >
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        { wishlistItems.map( ( item ) => (
          <WishlistItemCard
            key={ item.id }
            item={ item }
            isAuthenticated={ isAuthenticated }
            onRemove={ removeItem }
            onMoveToCart={ moveToCart }
            onAddToCart={ handleAddToCart }
            removingIds={ removingIds }
            addingToCartIds={ addingToCartIds }
          />
        ) ) }
      </div>
    </Section>
  );
};

export default WishlistPage;