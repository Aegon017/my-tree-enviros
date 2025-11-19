import { fetchJson } from "@/lib/fetch-json";
import { authStorage } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function headers() {
  const token = authStorage.getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...( token ? { Authorization: `Bearer ${ token }` } : {} ),
  };
}

export const wishlistService = {
  getWishlist() {
    return fetchJson( `${ API_BASE }/wishlist`, { method: "GET", headers: headers() } ).then( ( r ) => r.data );
  },

  addToWishlist( payload: { product_id: number; product_variant_id?: number } ) {
    return fetchJson( `${ API_BASE }/wishlist/items`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify( payload ),
    } ).then( ( r ) => r.data );
  },

  removeFromWishlist( itemId: number ) {
    return fetchJson( `${ API_BASE }/wishlist/items/${ itemId }`, { method: "DELETE", headers: headers() } ).then( ( r ) => r.data );
  },

  removeFromWishlistByVariant( productId: number, variantId: number ) {
    return fetchJson( `${ API_BASE }/wishlist/items/variant/${ variantId }`, { method: "DELETE", headers: headers() } ).then( ( r ) => r.data );
  },

  checkInWishlist( productId: number, variantId?: number ) {
    const url = variantId ? `${ API_BASE }/wishlist/check/${ productId }?variant_id=${ variantId }` : `${ API_BASE }/wishlist/check/${ productId }`;
    return fetchJson( url, { method: "GET", headers: headers() } ).then( ( r ) => r.data );
  },

  moveToCart( itemId: number, quantity = 1 ) {
    return fetchJson( `${ API_BASE }/wishlist/items/${ itemId }/move-to-cart`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify( { quantity } ),
    } ).then( ( r ) => r.data );
  },
};