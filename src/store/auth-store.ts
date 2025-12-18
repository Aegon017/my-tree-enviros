import { create } from "zustand";
import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth.services";
import { useCartStore } from "@/modules/cart/store/cart.store";
import { cartService } from "@/modules/cart/services/cart.service";
import { toast } from "sonner";

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

      get().setToken(token);
      get().setUser(user);

      const cartStore = useCartStore.getState();
      const guestItems = cartStore.cart.items;

      if (guestItems.length > 0) {
        try {
          for (const item of guestItems) {
            const payload = { ...item };
            // Ensure tree_id is present if it's a tree item
            if (payload.tree?.id && !payload.tree_id) {
              payload.tree_id = payload.tree.id;
            }
            await cartService.add(payload);
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
      useCartStore.getState().clearCart();
      toast.success("Signed out successfully");
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
