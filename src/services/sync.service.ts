"use client";

import { cartService } from "./cart.service";

export const syncService = {
  syncCart: async ( guestCart: any[] ): Promise<boolean> => {
    if ( !guestCart || guestCart.length === 0 ) {
      return true;
    }

    try {
      const items = guestCart.map( ( item ) => ( {
        product_id: item.product_id,
        type: item.type,
        product_type: item.product_type,
        quantity: item.quantity,
        duration: item.duration,
        name: item.name,
        occasion: item.occasion,
        message: item.message,
        location_id: item.location_id,
      } ) );

      const response = await cartService.syncCart( { items } );
      return response.success;
    } catch ( error ) {
      console.error( "Failed to sync cart:", error );
      return false;
    }
  },

  fetchCartFromBackend: async () => {
    try {
      const response = await cartService.getCart();
      return response.data || [];
    } catch ( error ) {
      console.error( "Failed to fetch cart:", error );
      return [];
    }
  },

  syncAllOnLogin: async (
    guestCart: any[],
  ): Promise<{
    cart: any[];
    success: boolean;
  }> => {
    try {
      await syncService.syncCart( guestCart );

      const [ cart ] = await Promise.all( [
        syncService.fetchCartFromBackend(),
      ] );

      return {
        cart: Array.isArray( cart ) ? cart : ( cart?.cart?.items || [] ),
        success: true,
      };
    } catch ( error ) {
      console.error( "Failed to sync data on login:", error );
      return {
        cart: guestCart,
        success: false,
      };
    }
  },

  handleLogout: ( keepData: boolean = true ) => {
    if ( !keepData ) {
      if ( typeof window !== "undefined" ) {
        localStorage.removeItem( "guest_cart" );
      }
    }
  },
};
