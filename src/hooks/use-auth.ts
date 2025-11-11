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
import type { User } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";
import { syncService } from "@/services/sync.service";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isGuestCart = useSelector((state: RootState) => state.cart.isGuest);

  
  const login = useCallback(
    async (userData: User) => {
      dispatch(setUserAction(userData));

      
      if (isGuestCart) {
        try {
          const syncResult = await syncService.syncAllOnLogin(
            isGuestCart ? cartItems : []);

          if (syncResult.success) {
            
            if (isGuestCart) {
              dispatch(setCartItems(syncResult.cart));
              dispatch(markCartSynced());
            }
          }
        } catch (error) {
          console.error("Failed to sync cart/wishlist on login:", error);
          
        }
      }
    },
    [dispatch, cartItems, isGuestCart],
  );

  const logout = useCallback(async () => {
    try {
      dispatch(setLoadingAction(true));
      await authService.logout();
      dispatch(clearUserAction());
      authStorage.clearAll();
      dispatch(markCartGuest());
    } catch (error) {
      dispatch(clearUserAction());
      authStorage.clearAll();
      dispatch(markCartGuest());
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
