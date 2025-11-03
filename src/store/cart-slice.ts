"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/types/cart.type";

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  isGuest: boolean; // Track if cart is guest or synced with backend
}

const CART_STORAGE_KEY = "guest_cart";

// Load cart from localStorage
const loadGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

// Clear guest cart from localStorage
const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

const initialState: CartState = {
  items: loadGuestCart(),
  loading: false,
  error: null,
  isGuest: true,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to cart (guest or logged in)
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => {
          // Enhanced matching logic for both guest and backend cart formats
          const itemProductId = item.cart_id || item.id;
          const actionProductId = action.payload.cart_id || action.payload.id;
          
          return (
            itemProductId === actionProductId &&
            item.type === action.payload.type &&
            JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
          );
        }
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
        // Update other properties to match the newest item data
        if (action.payload.formatted_price && !existingItem.formatted_price) {
          existingItem.formatted_price = action.payload.formatted_price;
        }
        if (action.payload.subtotal && !existingItem.subtotal) {
          existingItem.subtotal = action.payload.subtotal;
        }
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }

      if (state.isGuest) {
        saveGuestCart(state.items);
      }
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; type: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id && item.type === action.payload.type,
      );

      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(i.id === action.payload.id && i.type === action.payload.type),
          );
        }
      }

      if (state.isGuest) {
        saveGuestCart(state.items);
      }
    },

    // Remove item from cart
    removeItem: (
      state,
      action: PayloadAction<{ id: number; type: string }>,
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id && item.type === action.payload.type),
      );

      if (state.isGuest) {
        saveGuestCart(state.items);
      }
    },

    // Clear all items
    clearCart: (state) => {
      state.items = [];
      if (state.isGuest) {
        clearGuestCart();
      }
    },

    // Set cart items (used when loading from backend)
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Mark cart as synced with backend
    markAsSynced: (state) => {
      state.isGuest = false;
      clearGuestCart(); // Clear guest cart after sync
    },

    // Mark cart as guest (on logout)
    markAsGuest: (state) => {
      state.isGuest = true;
      saveGuestCart(state.items);
    },

    // Sync from localStorage
    syncFromStorage: (state) => {
      if (state.isGuest) {
        state.items = loadGuestCart();
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setCartItems,
  setLoading,
  setError,
  markAsSynced,
  markAsGuest,
  syncFromStorage,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
export const selectIsGuestCart = (state: { cart: CartState }) =>
  state.cart.isGuest;
