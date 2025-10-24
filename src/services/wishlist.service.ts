"use client";

import api from "@/lib/axios";

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product_type: number; // 1 = tree, 2 = ecom product
  created_at: string;
  updated_at: string;
  ecom_product?: {
    id: number;
    name: string;
    price: number;
    main_image_url?: string;
    stock: number;
    status: number;
  };
  product?: {
    id: number;
    name: string;
    main_image_url?: string;
    quantity: number;
    status: number;
    price: Array<{
      duration: number;
      price: string;
    }>;
  };
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
}

export interface AddToWishlistPayload {
  product_id: number;
  product_type: number; // 1 = tree, 2 = ecom product
}

export interface SyncWishlistPayload {
  items: Array<{
    product_id: number;
    product_type: number;
  }>;
}

export interface CheckWishlistResponse {
  success: boolean;
  message: string;
  data: {
    in_wishlist: boolean;
    wishlist_item_id?: number;
  };
}

/**
 * Wishlist Service for managing user wishlist
 * All endpoints are protected and require authentication
 */
export const wishlistService = {
  /**
   * Get all wishlist items for the authenticated user
   */
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get<{success: boolean, message: string, data: {wishlist: any}}>("/wishlist");
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.wishlist.items || []
    };
  },

  /**
   * Add item to wishlist
   * @param payload - Wishlist item details
   */
  addToWishlist: async (
    payload: AddToWishlistPayload,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistResponse>(
      "/wishlist/items",
      payload,
    );
    return response.data;
  },

  /**
   * Remove item from wishlist
   * @param itemId - Wishlist item ID
   */
  removeFromWishlist: async (itemId: number): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistResponse>(
      `/wishlist/items/${itemId}`,
    );
    return response.data;
  },

  /**
   * Clear all items from wishlist
   */
  clearWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistResponse>("/wishlist");
    return response.data;
  },

  /**
   * Move wishlist item to cart
   * @param itemId - Wishlist item ID
   */
  moveToCart: async (itemId: number): Promise<WishlistResponse> => {
    const response = await api.post<WishlistResponse>(
      `/wishlist/items/${itemId}/move-to-cart`,
    );
    return response.data;
  },

  /**
   * Check if a product is in wishlist
   * @param productId - Product ID
   */
  checkInWishlist: async (
    productId: number,
  ): Promise<CheckWishlistResponse> => {
    const response = await api.get<CheckWishlistResponse>(
      `/wishlist/check/${productId}`,
    );
    return response.data;
  },

  /**
   * Sync guest wishlist items with authenticated user's wishlist
   * This is called after login to merge guest wishlist with user's wishlist
   * @param payload - Guest wishlist items to sync
   */
  syncWishlist: async (
    payload: SyncWishlistPayload,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistResponse>(
      "/wishlist/sync",
      payload,
    );
    return response.data;
  },

  /**
   * Toggle wishlist status (add if not present, remove if present)
   * @param productId - Product ID
   * @param productType - Product type (1 = tree, 2 = ecom product)
   */
  toggleWishlist: async (
    productId: number,
    productType: number,
  ): Promise<WishlistResponse> => {
    try {
      const checkResponse = await wishlistService.checkInWishlist(productId);

      if (
        checkResponse.data.in_wishlist &&
        checkResponse.data.wishlist_item_id
      ) {
        // Remove from wishlist
        return await wishlistService.removeFromWishlist(
          checkResponse.data.wishlist_item_id,
        );
      } else {
        // Add to wishlist
        return await wishlistService.addToWishlist({
          product_id: productId,
          product_type: productType,
        });
      }
    } catch (error) {
      console.error("Toggle wishlist failed:", error);
      throw error;
    }
  },

  /**
   * Check if product is available
   * @param item - Wishlist item
   */
  isAvailable: (item: WishlistItem): boolean => {
    if (item.product_type === 2 && item.ecom_product) {
      return item.ecom_product.status === 1 && item.ecom_product.stock > 0;
    }

    if (item.product_type === 1 && item.product) {
      return item.product.status === 1 && item.product.quantity > 0;
    }

    return false;
  },

  /**
   * Get product name from wishlist item
   * @param item - Wishlist item
   */
  getProductName: (item: WishlistItem): string => {
    if (item.product_type === 2 && item.ecom_product) {
      return item.ecom_product.name;
    }

    if (item.product_type === 1 && item.product) {
      return item.product.name;
    }

    return "Unknown Product";
  },

  /**
   * Get product price from wishlist item
   * @param item - Wishlist item
   */
  getProductPrice: (item: WishlistItem): number => {
    if (item.product_type === 2 && item.ecom_product) {
      return item.ecom_product.price;
    }

    if (
      item.product_type === 1 &&
      item.product &&
      item.product.price.length > 0
    ) {
      // Return the cheapest price option
      return Math.min(...item.product.price.map((p) => parseFloat(p.price)));
    }

    return 0;
  },

  /**
   * Get product image from wishlist item
   * @param item - Wishlist item
   */
  getProductImage: (item: WishlistItem): string | undefined => {
    if (item.product_type === 2 && item.ecom_product) {
      return item.ecom_product.main_image_url;
    }

    if (item.product_type === 1 && item.product) {
      return item.product.main_image_url;
    }

    return undefined;
  },
};
