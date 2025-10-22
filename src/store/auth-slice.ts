"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authStorage } from "@/lib/auth-storage";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: authStorage.getUser(),
  isAuthenticated: !!authStorage.getUser(),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      authStorage.setUser(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      authStorage.clearUser();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    syncAuthFromStorage: (state) => {
      const user = authStorage.getUser();
      state.user = user;
      state.isAuthenticated = !!user;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        authStorage.setUser(state.user);
      }
    },
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  syncAuthFromStorage,
  updateUser,
} = authSlice.actions;
export default authSlice.reducer;
