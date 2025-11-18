"use client";

import { cartServerApi } from "@/services/cart-server";
import { cartUnifiedService } from "@/services/cart-unified";
import { useGuestCartStore } from "@/store/cart-store";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

export function useCart() {
  const guestItems = useGuestCartStore( ( s ) => s.items );

  const [ serverCart, setServerCart ] = useState<any | null>( null );
  const [ loading, setLoading ] = useState( false );
  const [ authenticated, setAuthenticated ] = useState( false );

  useEffect( () => {
    async function load() {
      setLoading( true );
      try {
        const res = await cartServerApi.get();
        const cart = res.data?.data?.cart ?? null;

        if ( cart ) {
          setAuthenticated( true );
          setServerCart( cart );
        } else {
          setAuthenticated( false );
        }
      } catch {
        setAuthenticated( false );
      }
      setLoading( false );
    }
    load();
  }, [] );

  const items = useMemo(
    () => ( authenticated ? serverCart?.items ?? [] : guestItems ),
    [ authenticated, serverCart, guestItems ]
  );

  const add = async ( payload: any ) => {
    setLoading( true );
    try {
      if ( authenticated ) {
        await cartUnifiedService.addServer( payload );
        const res = await cartServerApi.get();
        setServerCart( res.data?.data?.cart ?? null );
      } else {
        cartUnifiedService.addGuest( payload );
        cartUnifiedService.mirrorGuestDebounced( payload );
      }
      toast.success( "Added to cart" );
    } catch ( error: any ) {
      toast.error( error?.response?.data?.message ?? "Something went wrong" );
    }
    setLoading( false );
  };

  const update = async ( idOrClientId: number | string, patch: any ) => {
    setLoading( true );
    try {
      if ( authenticated && typeof idOrClientId === "number" ) {
        await cartUnifiedService.updateServer( idOrClientId, patch );
        const res = await cartServerApi.get();
        setServerCart( res.data?.data?.cart ?? null );
      } else {
        cartUnifiedService.updateGuest( idOrClientId as string, patch );
      }
    } finally {
      setLoading( false );
    }
  };

  const remove = async ( idOrClientId: number | string ) => {
    setLoading( true );
    try {
      if ( authenticated && typeof idOrClientId === "number" ) {
        await cartUnifiedService.removeServer( idOrClientId );
        const res = await cartServerApi.get();
        setServerCart( res.data?.data?.cart ?? null );
      } else {
        cartUnifiedService.removeGuest( idOrClientId as string );
      }
      toast.success( "Removed" );
    } finally {
      setLoading( false );
    }
  };

  const clear = async () => {
    setLoading( true );
    try {
      if ( authenticated ) {
        await cartUnifiedService.clearServer();
        setServerCart( { id: 0, items: [] } );
      } else {
        cartUnifiedService.clearGuest();
      }
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
    setServerCart,
    setAuthenticated,
  };
}