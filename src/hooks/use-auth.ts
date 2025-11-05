"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  clearUser as clearUserAction,
  setLoading as setLoadingAction,
  setUser as setUserAction,
} from "@/store/auth-slice";
import {
  setCartItems,
  markAsSynced as markCartSynced,
  markAsGuest as markCartGuest,
} from "@/store/cart-slice";
import {
  setWishlistItems,
  markAsSynced as markWishlistSynced,
  markAsGuest as markWishlistGuest,
} from "@/store/wishlist-slice";
import type { User } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { syncService } from "@/services/sync.service";
import { store } from "@/store";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isGuestCart = useSelector((state: RootState) => state.cart.isGuest);
  const isGuestWishlist = useSelector(
    (state: RootState) => state.wishlist.isGuest,
  );

  
  const login = useCallback(
    async (userData: User) => {
      dispatch(setUserAction(userData));

      
      if (isGuestCart || isGuestWishlist) {
        try {
          const syncResult = await syncService.syncAllOnLogin(
            isGuestCart ? cartItems : [],
            isGuestWishlist ? wishlistItems : [],
          );

          if (syncResult.success) {
            
            if (isGuestCart) {
              dispatch(setCartItems(syncResult.cart));
              dispatch(markCartSynced());
            }
            if (isGuestWishlist) {
              dispatch(setWishlistItems(syncResult.wishlist));
              dispatch(markWishlistSynced());
            }
          }
        } catch (error) {
          console.error("Failed to sync cart/wishlist on login:", error);
          
        }
      }
    },
    [dispatch, cartItems, wishlistItems, isGuestCart, isGuestWishlist],
  );

  
  const logout = useCallback(async () => {
    try {
      dispatch(setLoadingAction(true));
      await authService.logout();
      dispatch(clearUserAction());
      authStorage.clearAll();

      
      dispatch(markCartGuest());
      dispatch(markWishlistGuest());
    } catch (error) {
      console.error("Logout error:", error);
      
      dispatch(clearUserAction());
      authStorage.clearAll();

      
      dispatch(markCartGuest());
      dispatch(markWishlistGuest());
    } finally {
      dispatch(setLoadingAction(false));
    }
  }, [dispatch]);

  
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      dispatch(setLoadingAction(true));
      const response = await authService.me();

      if (response.success && response.data?.user) {
        dispatch(setUserAction(response.data.user));
        return true;
      }

      dispatch(clearUserAction());
      return false;
    } catch (error) {
      dispatch(clearUserAction());
      return false;
    } finally {
      dispatch(setLoadingAction(false));
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
  };
}
