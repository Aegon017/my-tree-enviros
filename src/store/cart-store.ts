"use client";

import { CartItem } from "@/domain/cart/cart-item";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type GuestCartState = {
    items: CartItem[];
    addItem: ( item: Omit<CartItem, "clientId"> ) => CartItem;
    updateItem: ( clientId: string, patch: Partial<CartItem> ) => void;
    removeItem: ( clientId: string ) => void;
    clear: () => void;
    replaceItems: ( serverItems: CartItem[] ) => void;
};

function genClientId() {
    return "c_" + Math.random().toString( 36 ).slice( 2, 10 );
}

export const useGuestCartStore = create<GuestCartState>()(
    devtools(
        persist(
            ( set, get ) => ( {
                items: [],

                addItem: ( item ) => {
                    const newItem: CartItem = { ...( item as any ), clientId: genClientId() };
                    set( { items: [ ...get().items, newItem ] } );
                    return newItem;
                },

                updateItem: ( clientId, patch ) => {
                    set( {
                        items: get().items.map( ( i ) =>
                            i.clientId === clientId ? { ...i, ...( patch as any ) } : i
                        ),
                    } );
                },

                removeItem: ( clientId ) => {
                    set( { items: get().items.filter( ( i ) => i.clientId !== clientId ) } );
                },

                clear: () => set( { items: [] } ),

                replaceItems: ( serverItems ) => set( { items: serverItems } ),
            } ),
            {
                name: "guest-cart",
                partialize: ( state ) => ( { items: state.items } ),
            }
        )
    )
);