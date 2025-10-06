"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import WishlistItemCardSkeleton from "@/components/skeletons/wishlist-item-card-skeleton";
import { Button } from "@/components/ui/button";
import WishlistItemCard from "@/components/wishlist-item-card";
import { authStorage } from "@/lib/auth-storage";
import axiosInstance from "@/lib/axios";
import { fetcher } from "@/lib/fetcher";
import type { CartItem } from "@/types/cart.type";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistResponse {
  data: WishlistItem[];
  message: string;
}

interface RemoveResponse {
  data: Record<string, never>;
  message: string;
}

interface CartResponse {
  data: {
    items: CartItem[];
  };
}

const WishlistPage = () => {
  const [ removingIds, setRemovingIds ] = useState<number[]>( [] );
  const [ addingToCartIds, setAddingToCartIds ] = useState<number[]>( [] );
  const [ cartItems, setCartItems ] = useState<CartItem[]>( [] );

  const { data, error, isLoading, mutate } = useSWR<WishlistResponse>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/wishlist`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const { data: cartData, mutate: mutateCart } = useSWR<CartResponse>(
    authStorage.getToken() ? `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect( () => {
    if ( cartData?.data?.items ) {
      setCartItems( cartData.data.items );
    }
  }, [ cartData ] );

  const removeFromWishlist = async ( productId: number ) => {
    setRemovingIds( ( prev ) => [ ...prev, productId ] );

    try {
      const response = await axiosInstance.delete<RemoveResponse>(
        `/api/wishlist/remove/${ productId }`
      );

      mutate();
      toast.success( response.data.message || "Item removed from wishlist" );
    } catch ( error: any ) {
      const errorMessage = error.response?.status === 401
        ? "Unauthorized - Please log in to manage your wishlist"
        : "Failed to remove item from wishlist";

      toast.error( errorMessage );
    } finally {
      setRemovingIds( ( prev ) => prev.filter( ( id ) => id !== productId ) );
    }
  };

  const addToCart = async ( productId: number, productType: number, productName: string ) => {
    const token = authStorage.getToken();
    if ( !token ) {
      toast.error( "Please login to add items to cart" );
      return;
    }

    setAddingToCartIds( ( prev ) => [ ...prev, productId ] );

    try {
      const response = await axiosInstance.post(
        `/api/cart/add/${ productId }`,
        {
          quantity: 1,
          type: productType,
          product_type: 2,
          cart_type: 1,
        }
      );

      if ( response.data.status ) {
        toast.success( `${ productName } added to cart` );
        mutateCart();
      } else {
        throw new Error( response.data.message || "Failed to add to cart" );
      }
    } catch ( error: any ) {
      toast.error( `Failed to add to cart - ${ error.response?.data?.message || error.message }` );
    } finally {
      setAddingToCartIds( ( prev ) => prev.filter( ( id ) => id !== productId ) );
    }
  };

  if ( isLoading ) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          { Array.from( { length: 6 } ).map( ( _, index ) => (
            <WishlistItemCardSkeleton key={ `wishlist-skeleton-${ index }` } />
          ) ) }
        </div>
      </Section>
    );
  }

  if ( error ) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Unable to load wishlist
          </h3>
          <p className="text-muted-foreground mb-4">{ error.message }</p>
          <Button onClick={ () => mutate() }>Try Again</Button>
        </div>
      </Section>
    );
  }

  const wishlistItems = data?.data || [];

  if ( wishlistItems.length === 0 ) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground">
            Start adding your favorite trees to see them here!
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        align="center"
        title="Wishlist"
        subtitle={ `You have ${ wishlistItems.length } item${ wishlistItems.length !== 1 ? "s" : "" } in your wishlist` }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        { wishlistItems.map( ( wishlistItem ) => (
          <WishlistItemCard
            key={ wishlistItem.id }
            wishlistItem={ wishlistItem }
            removingIds={ removingIds }
            addingToCartIds={ addingToCartIds }
            cartItems={ cartItems }
            onRemove={ removeFromWishlist }
            onAddToCart={ addToCart }
          />
        ) ) }
      </div>
    </Section>
  );
};

export default WishlistPage;