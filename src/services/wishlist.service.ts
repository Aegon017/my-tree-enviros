import { authStorage } from "@/lib/auth-storage";
import api from "@/lib/axios";
import { toast } from "sonner";

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
};