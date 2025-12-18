import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "../store/cart.store";
import { CartItem } from "@/domain/cart/cart-item";

export function useCart() {
  const token = useAuthStore((s) => s.token);

  const {
    cart,
    loading,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    fetchServerCart,
  } = useCartStore();

  const authenticated = !!token;

  useEffect(() => {
    if (authenticated) {
      fetchServerCart();
    }
  }, [authenticated, fetchServerCart]);

  const items = useMemo(() => cart.items as CartItem[], [cart.items]);

  const add = async (payload: any) => {
    try {
      await addToCart(payload);
      toast.success("Added to cart");
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Something went wrong");
    }
  };

  const update = async (id: number | string, patch: any) => {
    try {
      await updateItem(id, patch);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to update item");
    }
  };

  const remove = async (id: number | string) => {
    try {
      await removeItem(id);
      toast.success("Removed from cart");
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to remove item");
    }
  };

  const clear = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to clear cart");
    }
  };

  return {
    loading,
    authenticated,
    cart,
    items,
    add,
    update,
    remove,
    clear,
  };
}
