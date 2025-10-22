"use client";

import { cartService } from "./cart.service";
import { wishlistService } from "./wishlist.service";

/**
 * Service to sync guest cart and wishlist with backend on login
 */
export const syncService = {
  /**
   * Sync guest cart to backend after login
   * @param guestCart - Array of cart items from localStorage
   */
  syncCart: async (guestCart: any[]): Promise<boolean> => {
    if (!guestCart || guestCart.length === 0) {
      return true; // Nothing to sync
    }

    try {
      // Transform guest cart items to match backend format
      const items = guestCart.map((item) => ({
        product_id: item.product_id,
        type: item.type,
        product_type: item.product_type,
        quantity: item.quantity,
        duration: item.duration,
        name: item.name,
        occasion: item.occasion,
        message: item.message,
        location_id: item.location_id,
      }));

      // Send guest cart items to backend
      const response = await cartService.syncCart({ items });
      return response.success;
    } catch (error) {
      console.error("Failed to sync cart:", error);
      return false;
    }
  },

  /**
   * Sync guest wishlist to backend after login
   * @param guestWishlist - Array of wishlist items from localStorage
   */
  syncWishlist: async (guestWishlist: any[]): Promise<boolean> => {
    if (!guestWishlist || guestWishlist.length === 0) {
      return true; // Nothing to sync
    }

    try {
      // Transform guest wishlist items to match backend format
      const items = guestWishlist.map((item) => ({
        product_id: item.id || item.product_id,
        product_type: item.type === "tree" ? 1 : 2,
      }));

      // Send guest wishlist items to backend
      const response = await wishlistService.syncWishlist({ items });
      return response.success;
    } catch (error) {
      console.error("Failed to sync wishlist:", error);
      return false;
    }
  },

  /**
   * Fetch cart from backend after login
   */
  fetchCartFromBackend: async () => {
    try {
      const response = await cartService.getCart();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      return [];
    }
  },

  /**
   * Fetch wishlist from backend after login
   */
  fetchWishlistFromBackend: async () => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      return [];
    }
  },

  /**
   * Complete sync process: merge guest data with backend data
   * Called after successful login
   */
  syncAllOnLogin: async (
    guestCart: any[],
    guestWishlist: any[],
  ): Promise<{
    cart: any[];
    wishlist: any[];
    success: boolean;
  }> => {
    try {
      // Sync guest cart to backend
      await syncService.syncCart(guestCart);

      // Sync guest wishlist to backend
      await syncService.syncWishlist(guestWishlist);

      // Fetch merged data from backend
      const [cart, wishlist] = await Promise.all([
        syncService.fetchCartFromBackend(),
        syncService.fetchWishlistFromBackend(),
      ]);

      return {
        cart,
        wishlist,
        success: true,
      };
    } catch (error) {
      console.error("Failed to sync data on login:", error);
      return {
        cart: guestCart,
        wishlist: guestWishlist,
        success: false,
      };
    }
  },

  /**
   * Clear synced data on logout
   * Optionally keep data in guest mode
   */
  handleLogout: (keepData: boolean = true) => {
    if (!keepData) {
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("guest_cart");
        localStorage.removeItem("guest_wishlist");
      }
    }
    // If keepData is true, cart and wishlist stay in guest mode
  },
};
