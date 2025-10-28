"use client";

import api from "@/lib/axios";

/**
 * Backend-aligned Wishlist types (Api V1)
 * Resource shapes are normalized for frontend consumption where needed.
 */

export interface WishlistStock {
  is_instock: boolean;
  quantity: number;
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  product_id: number;
  product_variant_id?: number | null;
  is_variant: boolean;
  product_name: string;
  product_image?: string | null;
  // Expanded objects when present (controller loads relations before responding)
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price?: number | null;
    main_image_url?: string;
    quantity?: number; // from resource.inventory.stock_quantity
    inventory?: {
      id: number | null;
      stock_quantity: number;
      is_instock: boolean;
      has_variants: boolean;
    };
    // variants may be sent, but we won't rely on it for the wishlist item
  };
  product_variant?: {
    id: number;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    variant_name?: string;
    stock_quantity?: number;
    is_instock?: boolean;
    price?: number | null;
    product?: {
      id: number | null;
      name: string | null;
      slug: string | null;
    };
  };
  stock: WishlistStock;
  created_at: string;
  updated_at: string;

  // For backward compatibility in UI badges where we previously had tree vs product
  // In this backend, wishlist is for e-commerce products only, so set 2 (product)
  product_type?: 2;
}

export interface WishlistResource {
  id: number;
  user_id: number;
  items: WishlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistApiEnvelope {
  success: boolean;
  message: string;
  data: {
    wishlist: WishlistResource;
  };
}

export interface WishlistMoveToCartEnvelope {
  success: boolean;
  message: string;
  data: {
    cart: unknown;
    wishlist: WishlistResource;
  };
}

/**
 * Public response used by UI (kept compatible with existing calls)
 * data carries a flat array of normalized WishlistItem entries
 */
export interface WishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
}

export interface AddToWishlistPayload {
  product_id: number;
  product_variant_id?: number | null;
}

export interface SyncWishlistPayload {
  items: Array<{
    product_id: number;
    product_variant_id?: number | null;
  }>;
}

export interface CheckWishlistResponse {
  success: boolean;
  message: string;
  data: {
    in_wishlist: boolean;
    product_id: number;
    variant_id: number | null;
  };
}

/**
 * Internal: normalize items to add product_type = 2 for UI compatibility
 */
function normalizeItems(
  items: WishlistItem[] | undefined | null,
): WishlistItem[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((it) => ({
    ...it,
    product_type: 2 as const,
  }));
}

/**
 * Wishlist Service aligned with backend API (Api V1)
 */
export const wishlistService = {
  /**
   * Get all wishlist items for the authenticated user
   * GET /wishlist
   */
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get<WishlistApiEnvelope>("/wishlist");
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  /**
   * Add item to wishlist
   * POST /wishlist/items
   */
  addToWishlist: async (
    payload: AddToWishlistPayload,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistApiEnvelope>(
      "/wishlist/items",
      payload,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  /**
   * Remove item from wishlist by wishlist item id
   * DELETE /wishlist/items/{id}
   */
  removeFromWishlist: async (itemId: number): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistApiEnvelope>(
      `/wishlist/items/${itemId}`,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  /**
   * Remove item from wishlist by product (+ optional variant)
   * Convenience method for UIs that only know product/variant
   */
  removeByProduct: async (
    productId: number,
    productVariantId?: number | null,
  ): Promise<WishlistResponse> => {
    // Find matching item id first
    const current = await wishlistService.getWishlist();
    const match = current.data.find(
      (it) =>
        it.product_id === productId &&
        (productVariantId
          ? it.product_variant_id === productVariantId
          : !it.product_variant_id),
    );

    if (!match) {
      // Nothing to remove; return current state
      return current;
    }

    return wishlistService.removeFromWishlist(match.id);
  },

  /**
   * Clear all items from wishlist
   * DELETE /wishlist
   */
  clearWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistApiEnvelope>("/wishlist");
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  /**
   * Move wishlist item to cart
   * POST /wishlist/items/{id}/move-to-cart
   */
  moveToCart: async (
    itemId: number,
    quantity?: number,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistMoveToCartEnvelope>(
      `/wishlist/items/${itemId}/move-to-cart`,
      quantity ? { quantity } : undefined,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  /**
   * Check if a product (and optional variant) is in wishlist
   * GET /wishlist/check/{productId}?variant_id={id}
   */
  checkInWishlist: async (
    productId: number,
    variantId?: number | null,
  ): Promise<CheckWishlistResponse> => {
    const response = await api.get<CheckWishlistResponse>(
      `/wishlist/check/${productId}`,
      {
        params: {
          variant_id: variantId ?? undefined,
        },
      },
    );
    return response.data;
  },

  /**
   * Sync guest wishlist items with authenticated user's wishlist.
   * There is no bulk sync endpoint in backend. We perform client-side bulk add:
   * - For each item, check if it's already in wishlist
   * - If not, call add endpoint
   * - Finally, return the latest wishlist items
   */
  syncWishlist: async (
    payload: SyncWishlistPayload,
  ): Promise<WishlistResponse> => {
    const items = payload?.items ?? [];
    if (items.length === 0) {
      return wishlistService.getWishlist();
    }

    // Best-effort: sequentially check and add to avoid duplicate constraint errors
    for (const item of items) {
      try {
        const check = await wishlistService.checkInWishlist(
          item.product_id,
          item.product_variant_id ?? null,
        );
        if (!check.data.in_wishlist) {
          await wishlistService.addToWishlist({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id ?? null,
          });
        }
      } catch (err) {
        // Continue on error to attempt syncing remaining items
        // eslint-disable-next-line no-console
        console.error("Wishlist sync item failed:", err);
      }
    }

    return wishlistService.getWishlist();
  },

  /**
   * Toggle wishlist status (add if not present, remove if present)
   */
  toggleWishlist: async (
    productId: number,
    productVariantId?: number | null,
  ): Promise<WishlistResponse> => {
    const check = await wishlistService.checkInWishlist(
      productId,
      productVariantId ?? null,
    );

    if (check.data.in_wishlist) {
      return wishlistService.removeByProduct(
        productId,
        productVariantId ?? null,
      );
    }

    return wishlistService.addToWishlist({
      product_id: productId,
      product_variant_id: productVariantId ?? null,
    });
  },

  /**
   * Helper: Check availability
   */
  isAvailable: (item: WishlistItem): boolean => {
    // Legacy guest shape fallback (old localStorage schema with ecom_product)
    const legacy: any = item as any;
    if (legacy?.ecom_product) {
      return (
        legacy.ecom_product.status === 1 && (legacy.ecom_product.stock ?? 0) > 0
      );
    }
    return !!item?.stock?.is_instock && (item?.stock?.quantity ?? 0) > 0;
  },

  /**
   * Helper: Get product name
   */
  getProductName: (item: WishlistItem): string => {
    if (item?.product_name) return item.product_name;

    // Legacy guest shape fallback
    const legacy: any = item as any;
    if (legacy?.ecom_product?.name) return legacy.ecom_product.name;

    if (item?.is_variant) {
      const base = item?.product_variant?.product?.name ?? "Product";
      const variant = item?.product_variant?.variant_name ?? "";
      return variant ? `${base} (${variant})` : base;
    }
    return item?.product?.name ?? "Product";
  },

  /**
   * Helper: Get effective product price (variant price has priority if present)
   */
  getProductPrice: (item: WishlistItem): number => {
    if (item?.product_variant?.price != null) {
      return Number(item.product_variant.price) || 0;
    }

    // Legacy guest shape fallback
    const legacy: any = item as any;
    if (legacy?.ecom_product?.price != null) {
      return Number(legacy.ecom_product.price) || 0;
    }

    const discount = item?.product?.discount_price;
    if (discount != null) return Number(discount) || 0;
    return Number(item?.product?.price ?? 0) || 0;
  },

  /**
   * Helper: Get product image URL
   */
  getProductImage: (item: WishlistItem): string | undefined => {
    if (item?.product_image) return item.product_image || undefined;

    // Legacy guest shape fallback
    const legacy: any = item as any;
    if (legacy?.ecom_product?.main_image_url) {
      return legacy.ecom_product.main_image_url;
    }

    return item?.product?.main_image_url || undefined;
  },
};

// Legacy-style named exports for convenience (optional)
export async function getWishlist() {
  const response = await wishlistService.getWishlist();
  return response.data;
}
