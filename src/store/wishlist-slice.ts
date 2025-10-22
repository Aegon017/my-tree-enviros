"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id: number;
  name: string;
  type: "tree" | "product";
  price: number;
  image: string;
  slug?: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  isGuest: boolean;
}

const WISHLIST_STORAGE_KEY = "guest_wishlist";

// Load wishlist from localStorage
const loadGuestWishlist = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save wishlist to localStorage
const saveGuestWishlist = (items: WishlistItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save wishlist:", error);
  }
};

// Clear guest wishlist from localStorage
const clearGuestWishlist = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
};

const initialState: WishlistState = {
  items: loadGuestWishlist(),
  loading: false,
  error: null,
  isGuest: true,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Add item to wishlist
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some(
        (item) =>
          item.id === action.payload.id && item.type === action.payload.type,
      );

      if (!exists) {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });

        if (state.isGuest) {
          saveGuestWishlist(state.items);
        }
      }
    },

    // Remove item from wishlist
    removeFromWishlist: (
      state,
      action: PayloadAction<{ id: number; type: string }>,
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id && item.type === action.payload.type),
      );

      if (state.isGuest) {
        saveGuestWishlist(state.items);
      }
    },

    // Toggle item in wishlist
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id && item.type === action.payload.type,
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });
      }

      if (state.isGuest) {
        saveGuestWishlist(state.items);
      }
    },

    // Clear all items
    clearWishlist: (state) => {
      state.items = [];
      if (state.isGuest) {
        clearGuestWishlist();
      }
    },

    // Set wishlist items (used when loading from backend)
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
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

    // Mark wishlist as synced with backend
    markAsSynced: (state) => {
      state.isGuest = false;
      clearGuestWishlist(); // Clear guest wishlist after sync
    },

    // Mark wishlist as guest (on logout)
    markAsGuest: (state) => {
      state.isGuest = true;
      saveGuestWishlist(state.items);
    },

    // Sync from localStorage
    syncFromStorage: (state) => {
      if (state.isGuest) {
        state.items = loadGuestWishlist();
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  setWishlistItems,
  setLoading,
  setError,
  markAsSynced,
  markAsGuest,
  syncFromStorage,
  clearError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;
export const selectWishlistItemCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;
export const selectIsInWishlist = (
  state: { wishlist: WishlistState },
  id: number,
  type: string,
) => state.wishlist.items.some((item) => item.id === id && item.type === type);
export const selectIsGuestWishlist = (state: { wishlist: WishlistState }) =>
  state.wishlist.isGuest;
