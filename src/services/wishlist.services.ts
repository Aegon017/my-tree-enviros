import api from "./http-client";

const WISHLIST_URL = "/wishlist";

export const wishlistService = {
  async getWishlist() {
    return api.get(WISHLIST_URL).then((r) => r.data);
  },

  async addToWishlist(payload: { product_id: number; product_variant_id?: number }) {
    return api.post(`${WISHLIST_URL}/items`, payload).then((r) => r.data);
  },

  async removeFromWishlist(itemId: number) {
    return api.delete(`${WISHLIST_URL}/items/${itemId}`).then((r) => r.data);
  },

  async removeFromWishlistByVariant(productId: number, variantId: number) {
    return api.delete(`${WISHLIST_URL}/items/variant/${variantId}`).then((r) => r.data);
  },

  async checkInWishlist(productId: number, variantId?: number) {
    const url = variantId ? `${WISHLIST_URL}/check/${productId}?variant_id=${variantId}` : `${WISHLIST_URL}/check/${productId}`;
    return api.get(url).then((r) => r.data);
  },

  async moveToCart(itemId: number, quantity = 1) {
    return api.post(`${WISHLIST_URL}/items/${itemId}/move-to-cart`, { quantity }).then((r) => r.data);
  },
};