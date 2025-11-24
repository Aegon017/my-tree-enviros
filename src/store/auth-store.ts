import { create } from "zustand";
import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth.services";
import { cartService } from "@/services/cart.services";
import { useCartStore } from "./cart-store";

type User = any;

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  login: (payload: {
    country_code: string;
    phone: string;
    otp: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: authStorage.getToken(),
  user: authStorage.getUser(),

  setToken(token) {
    if (token) authStorage.setToken(token);
    else authStorage.clearToken();
    set({ token });
  },

  setUser(user) {
    if (user) authStorage.setUser(user);
    else authStorage.clearUser();
    set({ user });
  },

  clearAuth() {
    authStorage.clearAll();
    set({ token: null, user: null });
  },

  async login(payload) {
    const res = await authService.verifyOtp(payload);

    if (res.data?.token) {
      const { token, user } = res.data;

      // Update Local State & Storage
      get().setToken(token);
      get().setUser(user);

      // Handle Cart Merge
      const cartStore = useCartStore.getState();
      const guestItems = cartStore.cart.items;

      if (guestItems.length > 0) {
        try {
          for (const item of guestItems) {
            await cartService.add(item);
          }
          cartStore.resetGuestCart();
        } catch (e) {
          console.error("Failed to merge cart", e);
        }
      }

      await cartStore.fetchServerCart();
    }
    return res;
  },

  async logout() {
    try {
      await authService.signOut();
    } finally {
      get().clearAuth();
      useCartStore.getState().clearCart(); // Clear cart on logout
    }
  },

  async checkAuth() {
    try {
      const res = await authService.me();
      if (res.data?.user) {
        get().setUser(res.data.user);
      }
    } catch (e) {
      get().clearAuth();
    }
  },
}));
