import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cart.service";
import { useAuthStore } from "@/store/auth-store";
import { CartItem } from "../types/cart.types";

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

        const cart = get().cart;

        if (payload.type === "product") {
          const existingItemIndex = cart.items.findIndex(
            (item) => item.product_variant_id === payload.product_variant_id,
          );

          if (existingItemIndex > -1) {
            const newItems = [...cart.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + payload.quantity,
            };
            set({ cart: { ...cart, items: newItems } });
            return;
          }
        } else {
          const existingItemIndex = cart.items.findIndex(
            (item) =>
              item.tree?.id === (payload.tree_id || payload.tree_instance_id) &&
              (item as any).plan_price_id === payload.plan_price_id,
          );

          if (existingItemIndex > -1) {
            const newItems = [...cart.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + payload.quantity,
            };
            set({ cart: { ...cart, items: newItems } });
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
            tree_id: tree.id,
            dedication: payload.dedication || null,
          };
        }

        set({ cart: { ...cart, items: [...cart.items, newItem] } });
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
        const newItems = cart.items.map((item) => {
          if (item.id === id || item.clientId === id) {
            const updatedItem = { ...item };

            if (payload.quantity) {
              updatedItem.quantity = payload.quantity;
            }
            if (payload.dedication) {
              updatedItem.dedication = payload.dedication;
            }
            if (
              payload.plan_price_id &&
              updatedItem.type !== "product" &&
              updatedItem.available_plans
            ) {
              const selectedPlan = updatedItem.available_plans.find(
                (plan: any) =>
                  plan.plan_prices.some(
                    (pp: any) => pp.id === payload.plan_price_id,
                  ),
              );
              if (selectedPlan) {
                const selectedPlanPrice = selectedPlan.plan_prices.find(
                  (pp: any) => pp.id === payload.plan_price_id,
                );
                if (selectedPlanPrice) {
                  (updatedItem as any).plan_price_id = payload.plan_price_id;
                  updatedItem.duration = selectedPlan.duration;
                  (updatedItem as any).duration_unit =
                    selectedPlan.duration_unit;
                  updatedItem.price = selectedPlanPrice.price;
                  (updatedItem as any).plan = {
                    id: selectedPlan.id,
                    duration: selectedPlan.duration,
                    duration_unit: selectedPlan.duration_unit,
                  };
                }
              }
            }

            if (
              payload.initiative_site_id !== undefined &&
              updatedItem.type !== "product"
            ) {
              updatedItem.initiative_site_id = payload.initiative_site_id;
            }
            return updatedItem;
          }
          return item;
        });

        set({ cart: { ...cart, items: newItems } });
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
        const newItems = cart.items.filter(
          (i) => i.id !== id && i.clientId !== id,
        );
        set({ cart: { ...cart, items: newItems } });
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
