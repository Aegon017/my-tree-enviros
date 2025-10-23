"use client";

import { createSelector } from "@reduxjs/toolkit";
import type { CartState } from "../cart-slice";
import type { CartItem } from "@/types/cart.type";

export const selectCart = (state: { cart: CartState }) => state.cart;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items
);

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items: CartItem[]) => items.reduce((total: number, item: CartItem) => total + item.quantity, 0)
);

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items: CartItem[]) => items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)
);

export const selectIsGuestCart = createSelector(
  [selectCart],
  (cart) => cart.isGuest
);