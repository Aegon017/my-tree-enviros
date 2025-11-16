"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { cartService } from "@/services/cart.service";

export function useCart() {
  const [ cart, setCart ] = useState<any>( null );
  const [ loading, setLoading ] = useState( true );

  const fetchCart = useCallback( async () => {
    try {
      const res = await cartService.get();
      setCart( res.data.data.cart );
    } catch {
      toast.error( "Failed to load cart" );
    } finally {
      setLoading( false );
    }
  }, [] );

  const refresh = async () => {
    await fetchCart();
  };

  const addProduct = async ( variantId: number, quantity = 1 ) => {
    try {
      const res = await cartService.addProduct( variantId, quantity );
      setCart( res.data.data.cart );
      toast.success( "Added to cart" );
    } catch ( e: any ) {
      toast.error( e?.response?.data?.message || "Error" );
    }
  };

  const addSponsor = async (
    treeId: number,
    planId: number,
    planPriceId: number,
    quantity: number,
    dedication?: any
  ) => {
    try {
      const res = await cartService.addSponsor(
        treeId,
        planId,
        planPriceId,
        quantity,
        dedication
      );
      setCart( res.data.data.cart );
      toast.success( "Tree sponsorship added to cart" );
    } catch ( e: any ) {
      toast.error( e?.response?.data?.message || "Error" );
    }
  };

  const addAdopt = async (
    treeId: number,
    planId: number,
    planPriceId: number,
    quantity: number,
    dedication?: any
  ) => {
    try {
      const res = await cartService.addAdopt(
        treeId,
        planId,
        planPriceId,
        quantity,
        dedication
      );
      setCart( res.data.data.cart );
      toast.success( "Tree adoption added to cart" );
    } catch ( e: any ) {
      toast.error( e?.response?.data?.message || "Error" );
    }
  };

  const increase = async ( itemId: number ) => {
    const item = cart.items.find( ( i: any ) => i.id === itemId );
    await update( itemId, item.quantity + 1 );
  };

  const decrease = async ( itemId: number ) => {
    const item = cart.items.find( ( i: any ) => i.id === itemId );
    if ( item.quantity <= 1 ) return;
    await update( itemId, item.quantity - 1 );
  };

  const update = async ( itemId: number, quantity: number ) => {
    try {
      const res = await cartService.updateQuantity( itemId, quantity );
      setCart( res.data.data.cart );
    } catch ( e: any ) {
      toast.error( e?.response?.data?.message || "Error" );
    }
  };

  const remove = async ( itemId: number ) => {
    try {
      const res = await cartService.remove( itemId );
      setCart( res.data.data.cart );
      toast.success( "Removed" );
    } catch {
      toast.error( "Error removing item" );
    }
  };

  const clear = async () => {
    try {
      const res = await cartService.clear();
      setCart( res.data.data.cart );
      toast.success( "Cart cleared" );
    } catch {
      toast.error( "Unable to clear cart" );
    }
  };

  useEffect( () => {
    fetchCart();
  }, [ fetchCart ] );

  return {
    cart,
    loading,
    refresh,
    addProduct,
    addSponsor,
    addAdopt,
    increase,
    decrease,
    update,
    remove,
    clear,
  };
}