import api from "@/lib/axios";
import type { WishlistItem } from "@/types/wishlist";

export const wishlistService = {
  async getWishlist() {
    const { data } = await api.get( "/wishlist" );
    return data;
  },

  async addToWishlist( payload: { product_id: number; product_variant_id?: number } ) {
    const { data } = await api.post( "/wishlist/items", payload );
    return data;
  },

  async removeFromWishlist( itemId: number ) {
    const { data } = await api.delete( `/wishlist/items/${ itemId }` );
    return data;
  },

  async clearWishlist() {
    const { data } = await api.delete( "/wishlist" );
    return data;
  },

  async checkInWishlist( productId: number, variantId?: number ) {
    const url = variantId
      ? `/wishlist/check/${ productId }?variant_id=${ variantId }`
      : `/wishlist/check/${ productId }`;
    const { data } = await api.get( url );
    return data;
  },

  async moveToCart( itemId: number, quantity = 1 ) {
    const { data } = await api.post( `/wishlist/items/${ itemId }/move-to-cart`, { quantity } );
    return data;
  },
};

export type { WishlistItem };