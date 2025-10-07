"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authStorage } from "@/lib/auth-storage";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: authStorage.getToken(),
  isAuthenticated: !!authStorage.getToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      authStorage.setToken(action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      authStorage.clearToken();
    },
    syncAuthFromStorage: (state) => {
      const token = authStorage.getToken();
      state.token = token;
      state.isAuthenticated = !!token;
    },
  },
});

export const { setToken, clearToken, syncAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
