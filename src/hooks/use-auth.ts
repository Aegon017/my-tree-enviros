"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  clearUser as clearUserAction,
  setLoading as setLoadingAction,
  setUser as setUserAction,
} from "@/store/auth-slice";
import type { User } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth-storage";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  const login = useCallback(
    async (userData: User) => {
      dispatch(setUserAction(userData));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      dispatch(setLoadingAction(true));
      await authService.logout();
      dispatch(clearUserAction());
      authStorage.clearAll();
    } catch (error) {
      dispatch(clearUserAction());
      authStorage.clearAll();
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
