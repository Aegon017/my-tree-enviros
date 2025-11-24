import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "@/services/cart.services";
import { useAuthStore } from "@/store/auth-store";
import { CartItem } from "@/types/cart.types";

interface CartState {
  cart: { items: CartItem[] };
  loading: boolean;
  hydrate: () => void;
  fetchServerCart: () => Promise<void>;
  addToCart: (payload: any) => Promise<void>;
  updateItem: (id: number | string, payload: any) => Promise<void>;
  removeItem: (id: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetGuestCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { items: [] },
      loading: false,

      hydrate: () => {
        const token = useAuthStore.getState().token;
        if (token) get().fetchServerCart();
      },

      fetchServerCart: async () => {
        set({ loading: true });
        try {
          const res = await cartService.index();
          if (res.data?.cart) {
            set({ cart: res.data.cart as any });
          }
        } catch (error) {
          console.error("Failed to fetch cart", error);
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (payload) => {
        const token = useAuthStore.getState().token;

        if (token) {
          set({ loading: true });
          try {
            const res = await cartService.add(payload);
            if (res.data?.cart) {
              set({ cart: res.data.cart as any });
            }
          } finally {
            set({ loading: false });
          }
          return;
        }

        // Guest Cart Logic - Note: Guest cart has limited functionality
        // For full features including plan changes, user should log in
        const cart = get().cart;

        if (payload.type === "product") {
          const existingItemIndex = cart.items.findIndex(
            (item) => item.product_variant_id === payload.product_variant_id,
          );

          if (existingItemIndex > -1) {
            const item = cart.items[existingItemIndex];
            item.quantity += payload.quantity;
            set({ cart: { ...cart } });
            return;
          }
        } else {
          const existingItemIndex = cart.items.findIndex(
            (item) =>
              item.tree?.id === payload.tree_id &&
              (item as any).plan_price_id === payload.plan_price_id,
          );

          if (existingItemIndex > -1) {
            const item = cart.items[existingItemIndex];
            item.quantity += payload.quantity;
            set({ cart: { ...cart } });
            return;
          }
        }

        let newItem: any = {
          clientId: Date.now(),
          type: payload.type,
          quantity: payload.quantity,
        };

        if (payload.type === "product") {
          const firstImage = payload.images?.[0];
          let imageUrl = null;

          if (typeof firstImage === "string") {
            imageUrl = firstImage;
          } else if (firstImage) {
            imageUrl =
              firstImage.url ||
              firstImage.original_url ||
              firstImage.src ||
              firstImage.image_url;
          }

          if (!imageUrl) {
            imageUrl = payload.product?.thumbnail_url || null;
          }

          newItem = {
            ...newItem,
            product_variant_id: payload.product_variant_id,
            name: payload.product?.name || "Product",
            price:
              payload.variant?.selling_price ||
              payload.variant?.original_price ||
              0,
            image_url: imageUrl,
            variant: {
              sku: payload.variant?.sku || null,
              color: payload.variant?.variant?.color?.name || null,
              size: payload.variant?.variant?.size?.name || null,
              planter: payload.variant?.variant?.planter?.name || null,
            },
          };
        } else if (payload.tree && payload.planPrice) {
          const tree = payload.tree;
          const planPrice = payload.planPrice;
          const planData = tree.plan_prices?.find(
            (pp: any) => pp.id === payload.plan_price_id,
          );

          const availablePlans =
            tree.plan_prices?.reduce((acc: any[], pp: any) => {
              const existingPlan = acc.find((p) => p.id === pp.plan.id);
              if (existingPlan) {
                existingPlan.plan_prices.push({
                  id: pp.id,
                  price: parseFloat(pp.price),
                  plan: {
                    id: pp.plan.id,
                    duration: pp.plan.duration,
                    duration_unit: pp.plan.duration_unit,
                  },
                });
              } else {
                acc.push({
                  id: pp.plan.id,
                  duration: pp.plan.duration,
                  duration_unit: pp.plan.duration_unit,
                  plan_prices: [
                    {
                      id: pp.id,
                      price: parseFloat(pp.price),
                      plan: {
                        id: pp.plan.id,
                        duration: pp.plan.duration,
                        duration_unit: pp.plan.duration_unit,
                      },
                    },
                  ],
                });
              }
              return acc;
            }, []) || [];

          newItem = {
            ...newItem,
            plan_price_id: payload.plan_price_id,
            duration: planData?.plan?.duration || planPrice.duration,
            duration_unit: planData?.plan?.duration_unit || "year",
            price: planPrice.price || 0,
            image_url: tree.image_urls?.[0] || tree.thumbnail_url || null,
            tree: {
              id: tree.id,
              name: tree.name,
            },
            plan: {
              id: planData?.plan?.id || payload.plan_id,
              duration: planData?.plan?.duration || planPrice.duration,
              duration_unit: planData?.plan?.duration_unit || "year",
            },
            available_plans: availablePlans,
            dedication: payload.dedication || null,
          };
        }

        cart.items.push(newItem);
        set({ cart: { ...cart } });
      },

      updateItem: async (id, payload) => {
        const token = useAuthStore.getState().token;

        if (token) {
          set({ loading: true });
          try {
            const res = await cartService.update(Number(id), payload);
            if (res.data?.cart) {
              set({ cart: res.data.cart as any });
            }
          } finally {
            set({ loading: false });
          }
          return;
        }

        // Guest Logic
        const cart = get().cart;
        const item = cart.items.find((i) => i.id === id || i.clientId === id);
        if (item) {
          if (payload.quantity) {
            item.quantity = payload.quantity;
          }
          if (payload.dedication) {
            item.dedication = payload.dedication;
          }
          if (
            payload.plan_price_id &&
            item.type !== "product" &&
            item.available_plans
          ) {
            const selectedPlan = item.available_plans.find((plan: any) =>
              plan.plan_prices.some(
                (pp: any) => pp.id === payload.plan_price_id,
              ),
            );
            if (selectedPlan) {
              const selectedPlanPrice = selectedPlan.plan_prices.find(
                (pp: any) => pp.id === payload.plan_price_id,
              );
              if (selectedPlanPrice) {
                (item as any).plan_price_id = payload.plan_price_id;
                item.duration = selectedPlan.duration;
                (item as any).duration_unit = selectedPlan.duration_unit;
                item.price = selectedPlanPrice.price;
                (item as any).plan = {
                  id: selectedPlan.id,
                  duration: selectedPlan.duration,
                  duration_unit: selectedPlan.duration_unit,
                };
              }
            }
          }
          set({ cart: { ...cart } });
        }
      },

      removeItem: async (id) => {
        const token = useAuthStore.getState().token;

        if (token) {
          set({ loading: true });
          try {
            const res = await cartService.destroy(Number(id));
            if (res.data?.cart) {
              set({ cart: res.data.cart as any });
            }
          } finally {
            set({ loading: false });
          }
          return;
        }

        // Guest Logic
        const cart = get().cart;
        cart.items = cart.items.filter((i) => i.id !== id && i.clientId !== id);
        set({ cart: { ...cart } });
      },

      clearCart: async () => {
        const token = useAuthStore.getState().token;

        if (token) {
          set({ loading: true });
          try {
            const res = await cartService.clear();
            if (res.data?.cart) {
              set({ cart: res.data.cart as any });
            }
          } finally {
            set({ loading: false });
          }
          return;
        }

        set({ cart: { items: [] } });
      },

      resetGuestCart: () => set({ cart: { items: [] } }),
    }),

    {
      name: "mte_cart",
      partialize: (state) => ({
        cart: state.cart,
      }),
    },
  ),
);
