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
    const response = await api.get<CartResponse>("/v1/cart");
    return response.data;
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
    const response = await api.post<CartResponse>("/v1/cart/items", {
      product_id: productId,
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
      `/v1/cart/items/${itemId}`,
      payload,
    );
    return response.data;
  },

  /**
   * Remove item from cart
   * @param itemId - Cart item ID
   */
  removeCartItem: async (itemId: number): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/v1/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear all items from cart
   */
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>("/v1/cart");
    return response.data;
  },

  /**
   * Sync guest cart items with authenticated user's cart
   * This is called after login to merge guest cart with user's cart
   * @param payload - Guest cart items to sync
   */
  syncCart: async (payload: SyncCartPayload): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/v1/cart/sync", payload);
    return response.data;
  },
};

// Legacy function exports for backward compatibility
export async function addToCart(productId: number, payload: AddToCartPayload) {
  return cartService.addToCart(productId, payload);
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
