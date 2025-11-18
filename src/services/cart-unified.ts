"use client";

import { useGuestCartStore } from "@/store/cart-store";
import { cartClientApi } from "./cart-client";
import debounce from "lodash.debounce";

export const cartUnifiedService = {
    addGuest: ( item: any ) => useGuestCartStore.getState().addItem( item ),
    updateGuest: ( clientId: string, patch: any ) =>
        useGuestCartStore.getState().updateItem( clientId, patch ),
    removeGuest: ( clientId: string ) =>
        useGuestCartStore.getState().removeItem( clientId ),
    clearGuest: () => useGuestCartStore.getState().clear(),

    addServer: ( payload: any ) => cartClientApi.add( payload ),
    updateServer: ( id: number, payload: any ) => cartClientApi.update( id, payload ),
    removeServer: ( id: number ) => cartClientApi.remove( id ),
    clearServer: () => cartClientApi.clear(),

    mirrorGuestDebounced: debounce( async ( payload: any ) => {
        try {
            await cartClientApi.add( payload );
        } catch { }
    }, 700 ),
};