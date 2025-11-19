import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "@/services/cart.services";
import { useAuthStore } from "@/store/auth-store";

type CartState = {
    cart: { items: any[] };
    loading: boolean;
    hydrate: () => void;
    fetchServerCart: () => Promise<void>;
    addToCart: ( payload: any ) => Promise<void>;
    updateItem: ( itemIndex: number, quantity: number ) => Promise<void>;
    removeItem: ( itemIndex: number ) => Promise<void>;
    clearCart: () => Promise<void>;
    resetGuestCart: () => void;
};

export const useCartStore = create<CartState>()(
    persist(
        ( set, get ) => ( {
            cart: { items: [] },
            loading: false,

            hydrate: () => {
                const token = useAuthStore.getState().token;
                if ( token ) get().fetchServerCart();
            },

            fetchServerCart: async () => {
                const res = await cartService.get();
                set( { cart: res.data.cart } );
            },

            addToCart: async ( payload ) => {
                const token = useAuthStore.getState().token;

                if ( token ) {
                    const res = await cartService.add( payload );
                    set( { cart: res.data.cart } );
                    return;
                }

                const cart = get().cart;
                cart.items.push( {
                    ...payload,
                    amount: payload.amount ?? 0,
                    total_amount: ( payload.amount ?? 0 ) * payload.quantity,
                } );
                set( { cart } );
            },

            updateItem: async ( itemIndex, quantity ) => {
                const token = useAuthStore.getState().token;

                if ( token ) {
                    const backendItem = get().cart.items[ itemIndex ];
                    const res = await cartService.update( backendItem.id, quantity );
                    set( { cart: res.data.cart } );
                    return;
                }

                const cart = get().cart;
                const item = cart.items[ itemIndex ];
                if ( item ) {
                    item.quantity = quantity;
                    item.total_amount = item.amount * quantity;
                }
                set( { cart } );
            },

            removeItem: async ( itemIndex ) => {
                const token = useAuthStore.getState().token;

                if ( token ) {
                    const backendItem = get().cart.items[ itemIndex ];
                    const res = await cartService.remove( backendItem.id );
                    set( { cart: res.data.cart } );
                    return;
                }

                const cart = get().cart;
                cart.items = cart.items.filter( ( _, i ) => i !== itemIndex );
                set( { cart } );
            },

            clearCart: async () => {
                const token = useAuthStore.getState().token;

                if ( token ) {
                    const res = await cartService.clear();
                    set( { cart: res.data.cart } );
                    return;
                }

                set( { cart: { items: [] } } );
            },

            resetGuestCart: () => set( { cart: { items: [] } } ),
        } ),

        {
            name: "mte_cart",
            partialize: ( state ) => ( {
                cart: state.cart,
            } ),
        }
    )
);