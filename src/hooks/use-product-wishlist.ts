"use client";

import { useState } from "react";
import { toast } from "sonner";
import { wishlistService } from "@/services/wishlist.service";
import { authStorage } from "@/lib/auth-storage";
import type { KeyedMutator } from "swr";
import type { Product } from "@/types/product.types";

export function useProductWishlist(
    productId?: number,
    variantId?: number,
    mutateProduct?: KeyedMutator<any>
) {
    const [ loginOpen, setLoginOpen ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const isAuth = authStorage.isAuthenticated();

    const toggleFavorite = async ( inWishlist: boolean ) => {
        if ( !isAuth ) {
            setLoginOpen( true );
            return;
        }

        if ( !productId || !variantId ) {
            toast.error( "No variant selected" );
            return;
        }

        setLoading( true );

        try {
            if ( inWishlist ) {
                // Try the new variant-based removal method first
                try {
                    await wishlistService.removeFromWishlistByVariant( productId, variantId );
                } catch ( variantError ) {
                    // Fallback to the original method if the new endpoint doesn't exist
                    await wishlistService.removeFromWishlist( variantId );
                }
                toast.success( "Removed from wishlist" );
            } else {
                await wishlistService.addToWishlist( { product_id: productId, product_variant_id: variantId } );
                toast.success( "Added to wishlist" );
            }

            // Optional: revalidate product data
            if ( mutateProduct ) {
                setTimeout(() => mutateProduct(), 1000);
            }
        } catch ( error ) {
            toast.error( "Failed to update wishlist" );
            console.error( "Wishlist error:", error );
        } finally {
            setLoading( false );
        }
    };

    return { toggleFavorite, loading, loginOpen, setLoginOpen };
}