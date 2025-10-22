"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  syncFromStorage,
  selectWishlistItems,
  selectWishlistItemCount,
  selectIsInWishlist,
  selectIsGuestWishlist,
} from "@/store/wishlist-slice";
import type { WishlistItem } from "@/store/wishlist-slice";

export function useWishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const itemCount = useSelector(selectWishlistItemCount);
  const isGuest = useSelector(selectIsGuestWishlist);
  const loading = useSelector((state: RootState) => state.wishlist.loading);
  const error = useSelector((state: RootState) => state.wishlist.error);

  const addItem = useCallback(
    (item: WishlistItem) => {
      dispatch(addToWishlist(item));
    },
    [dispatch],
  );

  const removeItem = useCallback(
    (id: number, type: string) => {
      dispatch(removeFromWishlist({ id, type }));
    },
    [dispatch],
  );

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      dispatch(toggleWishlist(item));
    },
    [dispatch],
  );

  const clearAll = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const syncWishlist = useCallback(() => {
    dispatch(syncFromStorage());
  }, [dispatch]);

  const isInWishlist = useCallback(
    (id: number, type: string) => {
      return items.some((item) => item.id === id && item.type === type);
    },
    [items],
  );

  return {
    items,
    itemCount,
    loading,
    error,
    isGuest,
    addItem,
    removeItem,
    toggleItem,
    clearAll,
    syncWishlist,
    isInWishlist,
  };
}
