"use client";

import { cartService } from "./cart.service";
import { wishlistService } from "./wishlist.service";


export const syncService = {
  
  syncCart: async (guestCart: any[]): Promise<boolean> => {
    if (!guestCart || guestCart.length === 0) {
      return true; 
    }

    try {
      
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

      
      const response = await cartService.syncCart({ items });
      return response.success;
    } catch (error) {
      console.error("Failed to sync cart:", error);
      return false;
    }
  },

  fetchCartFromBackend: async () => {
    try {
      const response = await cartService.getCart();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      return [];
    }
  },

  
  fetchWishlistFromBackend: async () => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      return [];
    }
  },

  
  syncWishlist: async (guestWishlist: any[]): Promise<boolean> => {
    if (!guestWishlist || guestWishlist.length === 0) {
      return true;
    }

    try {
      
      const items = guestWishlist.map((item) => ({
        product_id: item.product_id ?? item.id,
        product_variant_id: item.product_variant_id ?? null,
      }));

      
      const response = await wishlistService.syncWishlist({ items });
      return response.success;
    } catch (error) {
      console.error("Failed to sync wishlist:", error);
      return false;
    }
  },

  
  syncAllOnLogin: async (
    guestCart: any[],
    guestWishlist: any[],
  ): Promise<{
    cart: any[];
    wishlist: any[];
    success: boolean;
  }> => {
    try {
      
      await syncService.syncCart(guestCart);

      
      await syncService.syncWishlist(guestWishlist);

      
      const [cart, wishlist] = await Promise.all([
        syncService.fetchCartFromBackend(),
        syncService.fetchWishlistFromBackend(),
      ]);

      return {
        cart: Array.isArray(cart) ? cart : (cart?.cart?.items || []),
        wishlist: Array.isArray(wishlist) ? wishlist : (wishlist?.data || []),
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

  
  handleLogout: (keepData: boolean = true) => {
    if (!keepData) {
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("guest_cart");
        localStorage.removeItem("guest_wishlist");
      }
    }
    
  },
};
