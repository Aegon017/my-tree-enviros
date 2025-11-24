"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { wishlistService } from "@/services/wishlist.services";
import type { KeyedMutator } from "swr";

export function useProductWishlist(
  productId?: number,
  variantId?: number,
  mutateProduct?: KeyedMutator<any>,
) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const isAuth = !!token;

  const toggleFavorite = async (inWishlist: boolean) => {
    if (!isAuth) return setLoginOpen(true);
    if (!productId || !variantId) return toast.error("Select a variant first");
    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlistByVariant(productId, variantId);
        toast.success("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist({
          product_id: productId,
          product_variant_id: variantId,
        });
        toast.success("Added to wishlist");
      }
      mutateProduct?.();
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return { toggleFavorite, loading, loginOpen, setLoginOpen };
}
