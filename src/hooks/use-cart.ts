"use client";

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncFromStorage,
} from "@/store/cart-slice";
import {
  selectCartItems,
  selectIsGuestCart,
} from "@/store/selectors/cart-selectors";
import type { CartItem } from "@/types/cart.type";

export function useCart() {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const isGuest = useSelector(selectIsGuestCart);
  const loading = useSelector((state: RootState) => state.cart.loading);
  const error = useSelector((state: RootState) => state.cart.error);

  const addToCart = useCallback(
    (item: CartItem) => {
      dispatch(addItem(item));
    },
    [dispatch],
  );

  const updateItemQuantity = useCallback(
    (id: number, type: string, quantity: number) => {
      dispatch(updateQuantity({ id, type, quantity }));
    },
    [dispatch],
  );

  const removeFromCart = useCallback(
    (id: number, type: string) => {
      dispatch(removeItem({ id, type }));
    },
    [dispatch],
  );

  const clearAllItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const syncCart = useCallback(() => {
    dispatch(syncFromStorage());
  }, [dispatch]);

  const isInCart = useCallback(
    (id: number, type: string) => {
      return cartItems.some((item) => item.id === id && item.type === type);
    },
    [cartItems],
  );

  return {
    items: cartItems,
    itemCount,
    total,
    loading,
    error,
    isGuest,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearAllItems,
    syncCart,
    isInCart,
  };
}
