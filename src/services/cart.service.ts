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
  type: number; 
  product_type: number; 
  quantity: number;
  duration?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  product_variant_id?: number;
  item_type?: string; 
}

export interface AddTreeToCartPayload {
  
  tree_instance_id?: number;
  tree_id?: number;
  location_id?: number;

  
  tree_plan_price_id: number;

  
  quantity?: number;

  
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


export const cartService = {
  
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

  
  addTreeToCart: async (
    payload: AddTreeToCartPayload,
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      item_type: "tree",
      ...payload,
    });
    return response.data;
  },

  
  addCampaignToCart: async (
    payload: AddCampaignToCartPayload,
  ): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/items", {
      item_type: "campaign",
      ...payload,
    });
    return response.data;
  },

  
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

  
  removeCartItem: async (itemId: number): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/items/${itemId}`);
    return response.data;
  },

  
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>("/cart");
    return response.data;
  },

  
  syncCart: async (payload: SyncCartPayload): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/sync", payload);
    return response.data;
  },
};


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
