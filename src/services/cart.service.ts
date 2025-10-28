"use client";

import api from "@/lib/axios";

export interface CartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  product_id: number;
  quantity: number;
  duration?: number;
  coupon_code: string | null;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  ecom_product?: {
    id: number;
    name: string;
    price: number;
    main_image_url?: string;
  };
  product?: {
    id: number;
    name: string;
    main_image_url?: string;
    price: Array<{
      duration: number;
      price: string;
    }>;
  };
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface AddToCartPayload {
  type: number; // 1 = sponsor, 2 = adopt
  product_type: number; // 1 = tree, 2 = ecom product
  quantity: number;
  duration?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
}

export interface AddTreeToCartPayload {
  // Provide either a specific instance OR a combination of tree_id + location_id
  tree_instance_id?: number;
  tree_id?: number;
  location_id?: number;

  // Required plan price
  tree_plan_price_id: number;

  // Defaults to 1 for trees
  quantity?: number;

  // Optional dedication details
  name?: string;
  occasion?: string;
  message?: string;
}

export interface AddCampaignToCartPayload {
  campaign_id: number;
  amount?: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  duration?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
}

export interface SyncCartPayload {
  items: Array<{
    product_id: number;
    type: number;
    product_type: number;
    quantity: number;
    duration?: number;
    name?: string;
    occasion?: string;
    message?: string;
    location_id?: number;
  }>;
}

/**
 * Cart Service for managing cart operations
 * All endpoints are protected and require authentication
 */
export const cartService = {
  /**
   * Get all cart items for the authenticated user
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: { cart: any };
    }>("/cart");
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.cart.items || [],
    };
  },

  /**
   * Add item to cart
   * @param productId - Tree or Product ID
   * @param payload - Cart item details
   */
  addToCart: async (
    productId: number,
    payload: AddToCartPayload,
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      product_id: productId,
      ...payload,
    });
    return response.data;
  },

  /**
   * Add a tree to cart (Laravel v1 CartController)
   * Supports either:
   * - tree_instance_id + tree_plan_price_id
   * - tree_id + location_id + tree_plan_price_id
   * Optional: name, occasion, message, quantity
   */
  addTreeToCart: async (
    payload: AddTreeToCartPayload,
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      item_type: "tree",
      ...payload,
    });
    return response.data;
  },

  /**
   * Add a campaign to cart
   */
  addCampaignToCart: async (
    payload: AddCampaignToCartPayload,
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      item_type: "campaign",
      ...payload,
    });
    return response.data;
  },

  /**
   * Update cart item
   * @param itemId - Cart item ID
   * @param payload - Updated cart item details
   */
  updateCartItem: async (
    itemId: number,
    payload: UpdateCartItemPayload,
  ): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(
      `/cart/items/${itemId}`,
      payload,
    );
    return response.data;
  },

  /**
   * Remove item from cart
   * @param itemId - Cart item ID
   */
  removeCartItem: async (itemId: number): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear all items from cart
   */
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>("/cart");
    return response.data;
  },

  /**
   * Sync guest cart items with authenticated user's cart
   * This is called after login to merge guest cart with user's cart
   * @param payload - Guest cart items to sync
   */
  syncCart: async (payload: SyncCartPayload): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/sync", payload);
    return response.data;
  },
};

// Legacy function exports for backward compatibility
export async function addToCart(productId: number, payload: AddToCartPayload) {
  return cartService.addToCart(productId, payload);
}

export async function addTreeToCart(payload: AddTreeToCartPayload) {
  return cartService.addTreeToCart(payload);
}

export async function addCampaignToCart(payload: AddCampaignToCartPayload) {
  return cartService.addCampaignToCart(payload);
}

export async function getCart() {
  const response = await cartService.getCart();
  return response.data;
}

export async function removeCartItem(cartId: number) {
  return cartService.removeCartItem(cartId);
}

export async function clearCart() {
  return cartService.clearCart();
}

export async function addCartDetails(
  cartId: number,
  details: UpdateCartItemPayload,
) {
  return cartService.updateCartItem(cartId, details);
}
