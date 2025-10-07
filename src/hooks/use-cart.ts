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
  const {
    items: cartItems,
    loading,
    error,
  } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItem = async (productId: number, payload: any) => {
    return await dispatch(addItemToCart({ productId, payload })).unwrap();
  };

  const updateDetails = async (cartId: number, details: any) => {
    return await dispatch(updateCartItemDetails({ cartId, details })).unwrap();
  };

  const removeItem = async (cartId: number) => {
    return await dispatch(removeItemFromCart(cartId)).unwrap();
  };

  const clearCart = async () => {
    return await dispatch(clearCartItems()).unwrap();
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
