"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { wishlistService } from "@/services/wishlist.service";
import { authStorage } from "@/lib/auth-storage";

export function useProductWishlist( productId?: number, variantId?: number ) {
    const [ isFavorite, setIsFavorite ] = useState( false );
    const [ loginOpen, setLoginOpen ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const isAuth = authStorage.isAuthenticated();

    useEffect( () => {
        if ( !isAuth || !productId ) return;
        ( async () => {
            const res = await wishlistService.checkInWishlist( productId, variantId );
            setIsFavorite( res?.data?.in_wishlist );
        } )();
    }, [ isAuth, productId, variantId ] );

    const toggleFavorite = async () => {
        if ( !isAuth ) {
            setLoginOpen( true );
            return;
        }

        setLoading( true );

        try {
            if ( isFavorite ) {
                const res = await wishlistService.getWishlist();
                const item = res.data.wishlist.items.find(
                    ( i: any ) =>
                        i.product_id === productId &&
                        ( variantId ? i.product_variant_id === variantId : true )
                );
                if ( item ) await wishlistService.removeFromWishlist( item.id );
                setIsFavorite( false );
                toast.success( "Removed from wishlist" );
            } else {
                await wishlistService.addToWishlist( {
                    product_id: productId!,
                    product_variant_id: variantId,
                } );
                setIsFavorite( true );
                toast.success( "Added to wishlist" );
            }
        } finally {
            setLoading( false );
        }
    };

    return { isFavorite, loading, toggleFavorite, loginOpen, setLoginOpen };
}