"use client";

import api from "@/lib/axios";

export interface CartItem {
  id: number;
  cart_id: number;
  item_type: string;
  quantity: number;
  price: number;
  formatted_price: string;
  subtotal: number;
  formatted_subtotal: string;
  item: {
    type: string;
    name: string;
    sku: string;
    image: string;
    variant?: {
      sku: string;
      size: string | null;
      color: string | null;
    };
    color: string | null;
    size: string | null;
    product: {
      id: number;
      name: string | null;
      botanical_name: string;
      slug: string | null;
      sku: string;
      type: number;
      status: number;
      trash: number;
      category_id: number | null;
      category: {
        id: number | null;
        name: string;
        slug: string;
        icon: string;
        status: number;
      };
      description: string;
      short_description: string;
      price: number;
      selling_price: number;
      quantity: number;
      thumbnail_url: string;
      image_urls: string[];
      reviews: any[];
      wishlist_tag: boolean;
      created_at: string;
      updated_at: string;
      created_by: number;
      updated_by: number;
      rating: number;
      review_count: number;
      is_active: boolean | null;
      inventory: {
        id: number;
        stock_quantity: number;
        is_instock: boolean;
        has_variants: boolean;
      };
      variants: Array<{
        id: number;
        sku: string;
        inventory_id: number;
        variant_id: number;
        variant: {
          id: number;
          color: {
            id: number;
            name: string;
            code: string;
          };
          size: {
            id: number;
            name: string;
          };
          planter: {
            id: number;
            name: string;
          };
        };
        variant_name: string;
        original_price: number;
        selling_price: number;
        price: number;
        formatted_price: string;
        stock_quantity: number;
        is_instock: boolean;
        images: Array<{
          id: number;
          url: string;
        }>;
        created_at: string;
        updated_at: string;
      }>;
      default_variant: any;
      formatted_price: string;
      has_variants: boolean;
      default_variant_id: number;
      variant_options: {
        colors: Array<{
          id: number;
          name: string;
          code: string;
        }>;
        sizes: Array<{
          id: number;
          name: string;
        }>;
        planters: Array<{
          id: number;
          name: string;
          image_url: string;
        }>;
      };
    };
  };
  options?: {
    variant?: {
      sku: string;
      size: string | null;
      color: string | null;
    };
    product_name?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: {
      id: number;
      user_id: number;
      items: CartItem[];
      total_items: number;
      total_amount: number;
      formatted_total: string;
      expires_at: string;
      is_expired: boolean;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface CartItemsResponse {
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
    const response = await api.get<CartResponse>("/cart");
    return response.data;
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
