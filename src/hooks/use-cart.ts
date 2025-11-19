"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cartService } from "@/services/cart.service";

export function useCart() {
  const token = useAuthStore( ( s ) => s.token );

  const {
    cart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    fetchServerCart,
    resetGuestCart,
  } = useCartStore();

  const [ loading, setLoading ] = useState( false );
  const authenticated = !!token;

  useEffect( () => {
    if ( authenticated ) {
      setLoading( true );
      fetchServerCart().finally( () => setLoading( false ) );
    }
  }, [ authenticated ] );

  const items = useMemo( () => cart.items, [ cart.items ] );

  const add = async ( payload: any ) => {
    setLoading( true );
    try {
      await addToCart( payload );

      if ( authenticated ) {
        const res = await cartService.get();
        useCartStore.getState().cart = res.data.cart;
      }

      toast.success( "Added to cart" );
    } catch ( e: any ) {
      toast.error( e?.body?.message ?? "Something went wrong" );
    }
    setLoading( false );
  };

  const update = async ( indexOrId: number, patch: any ) => {
    setLoading( true );
    try {
      await updateItem( indexOrId, patch.quantity );
    } finally {
      setLoading( false );
    }
  };

  const remove = async ( indexOrId: number ) => {
    setLoading( true );
    try {
      await removeItem( indexOrId );
      toast.success( "Removed" );
    } finally {
      setLoading( false );
    }
  };

  const clear = async () => {
    setLoading( true );
    try {
      await clearCart();
      toast.success( "Cart cleared" );
    } finally {
      setLoading( false );
    }
  };

  return {
    loading,
    authenticated,
    items,
    add,
    update,
    remove,
    clear,
  };
}