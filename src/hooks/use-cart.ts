// hooks/useCart.ts
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
    addItemToCart,
    clearCartItems,
    fetchCart,
    removeItemFromCart,
    updateCartItemDetails,
} from "@/store/cart-slice";

export function useCart() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: cartItems, loading, error } = useSelector( ( state: RootState ) => state.cart );

    useEffect( () => {
        dispatch( fetchCart() );
    }, [ dispatch ] );

    const addItem = async (
        productId: number,
        payload: Parameters<typeof addItemToCart>[ 0 ][ "payload" ]
    ) => {
        await dispatch( addItemToCart( { productId, payload } ) ).unwrap();
    };

    const updateDetails = async ( cartId: number, details: Parameters<typeof updateCartItemDetails>[ 0 ][ "details" ] ) => {
        await dispatch( updateCartItemDetails( { cartId, details } ) ).unwrap();
    };

    const removeItem = async ( cartId: number ) => {
        await dispatch( removeItemFromCart( cartId ) ).unwrap();
    };

    const clearCart = async () => {
        await dispatch( clearCartItems() ).unwrap();
    };

    return {
        cartItems,
        loading,
        error,
        addItem,
        updateDetails,
        removeItem,
        clearCart,
    };
}