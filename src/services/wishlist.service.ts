import { authStorage } from "@/lib/auth-storage";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { WishlistItem } from "@/types/wishlist";

export interface WishlistItemLocal {
  id: number;
  product_id: number;
  name: string;
  type: string;
  price: number;
  image?: string;
  metadata?: Record<string, any>;
}

export const localWishlistService = {
  toggle( id: number, data: any ) {
    const raw = localStorage.getItem( "guest_wishlist" ) || "[]";
    const items = JSON.parse( raw );
    const exists = items.some( ( i: any ) => i.id === id && i.type === "product" );
    const updated = exists ? items.filter( ( i: any ) => !( i.id === id && i.type === "product" ) ) : [ ...items, data ];
    localStorage.setItem( "guest_wishlist", JSON.stringify( updated ) );
    return !exists;
  },
  check( id: number ) {
    const raw = localStorage.getItem( "guest_wishlist" ) || "[]";
    const items = JSON.parse( raw );
    return items.some( ( i: any ) => i.id === id && i.type === "product" );
  },
};

export const wishlistFacade = {
  async toggleProduct( id: number, data: any, toggleRemote: () => Promise<void> ) {
    const isAuth = authStorage.isAuthenticated();
    if ( !isAuth ) {
      const status = localWishlistService.toggle( id, data );
      toast.success( status ? `Added ${ data.name } to wishlist` : `Removed ${ data.name } from wishlist` );
      return status;
    }
    await toggleRemote();
    return true;
  },
};

export const wishlistService = {
  async toggleWishlist( productId: number ) {
    await api.request( {
      url: `/wishlist/toggle`,
      method: "POST",
      data: { product_id: productId },
    } );
  },

  async getWishlist() {
    const response = await api.get( "/wishlist" );
    return response.data;
  },

  async syncWishlist( items: { items: Array<{ product_id: number; product_variant_id?: number | null }> } ) {
    // First clear the current wishlist
    await api.delete( "/wishlist" );
    
    // Then add all items from guest wishlist
    for ( const item of items.items ) {
      await api.post( "/wishlist/items", {
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
      } );
    }
    
    return { success: true };
  },

  // Helper methods for wishlist items
  getProductName(item: WishlistItem | WishlistItemLocal): string {
    if ('product' in item) {
      return item.product.name || '';
    }
    return item.name || '';
  },

  getProductPrice(item: WishlistItem | WishlistItemLocal): number {
    if ('product' in item) {
      return item.product.selling_price || 0;
    }
    return item.price || 0;
  },

  getProductImage(item: WishlistItem | WishlistItemLocal): string | null {
    if ('product' in item) {
      return item.product.thumbnail_url || null;
    }
    return item.image || null;
  },

  isAvailable(item: WishlistItem | WishlistItemLocal): boolean {
    if ('product' in item) {
      return item.product.status === 1;
    }
    return true; // Assume available for guest items
  },

  async removeFromWishlist(itemId: number) {
    const response = await api.delete(`/wishlist/items/${itemId}`);
    return response.data;
  },

  async moveToCart(itemId: number) {
    const response = await api.post(`/wishlist/move-to-cart`, { item_id: itemId });
    return response.data;
  },

  async clearWishlist() {
    const response = await api.delete("/wishlist");
    return response.data;
  },
};

// Re-export the WishlistItem type so it can be imported from this module
export type { WishlistItem };