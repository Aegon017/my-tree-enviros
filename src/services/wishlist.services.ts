import api, { ApiResponse } from "./http-client";
import { WishlistItem } from "@/types/wishlist";

const WISHLIST_URL = "/wishlist";

export const wishlistService = {
  async getWishlist(): Promise<ApiResponse<{ wishlist: { items: WishlistItem[] } }>> {
    return api.get(WISHLIST_URL);
  },

  async addToWishlist(payload: { product_id: number; product_variant_id?: number }): Promise<ApiResponse> {
    return api.post(`${WISHLIST_URL}/items`, payload);
  },

  async removeFromWishlist(itemId: number): Promise<ApiResponse> {
    return api.delete(`${WISHLIST_URL}/items/${itemId}`);
  },

  async removeFromWishlistByVariant(productId: number, variantId: number): Promise<ApiResponse> {
    return api.delete(`${WISHLIST_URL}/items/variant/${variantId}`);
  },

  async checkInWishlist(productId: number, variantId?: number): Promise<ApiResponse<boolean>> {
    const url = variantId ? `${WISHLIST_URL}/check/${productId}?variant_id=${variantId}` : `${WISHLIST_URL}/check/${productId}`;
    return api.get(url);
  },

  async moveToCart(itemId: number, quantity = 1): Promise<ApiResponse> {
    return api.post(`${WISHLIST_URL}/items/${itemId}/move-to-cart`, { quantity });
  },
};