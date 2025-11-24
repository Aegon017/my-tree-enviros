"use client";

import api from "@/services/http-client";
import { ApiResponse } from "@/services/http-client";

export interface OrderItem {
  id: number;
  order_id: number;
  type: string;
  tree_id?: number;
  plan_id?: number;
  plan_price_id?: number;
  tree_instance_id?: number;
  product_variant_id?: number;
  quantity: number;
  amount: number;
  total_amount: number;
  tree_instance?: {
    id: number;
    tree: {
      id: number;
      name: string;
      common_name?: string;
      image_url?: string;
    };
    location?: {
      id: number;
      name: string;
    };
  };
  plan_price?: {
    id: number;
    price: number;
    plan: {
      id: number;
      name: string;
      type: string;
    };
  };
}

export interface Order {
  id: number;
  reference_number: string;
  user_id: number;
  status: string;
  payment_method?: string;
  subtotal: number;
  discount: number;
  gst_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  total: number;
  currency: string;
  coupon_id?: number;
  shipping_address_id?: number;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address?: any; // Define strictly if needed
  coupon?: any; // Define strictly if needed
}

export interface OrdersResponse extends ApiResponse<{
  orders: Order[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> { }

export interface OrderResponse extends ApiResponse<{
  order: Order;
}> { }

export interface CreateOrderPayload {
  coupon_id?: number;
  shipping_address_id?: number;
}

export interface CreateDirectOrderPayload {
  item_type: "tree" | "campaign";
  // Tree specific
  tree_instance_id?: number;
  tree_plan_price_id?: number;
  // Campaign specific
  campaign_id?: number;
  amount?: number;
  // Common
  quantity?: number;
  coupon_id?: number;
  shipping_address_id?: number;
}

export interface MyTreesResponse extends ApiResponse<{
  trees: OrderItem[]; // Reusing OrderItem as it contains tree details
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> { }

export interface OrderParams {
  status?: string;
  type?: string;
  per_page?: number;
  page?: number;
}

export const orderService = {
  getOrders: async (params?: OrderParams): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse["data"]>("/orders", { params });
    return response as OrdersResponse;
  },

  getOrderById: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse["data"]>(`/orders/${orderId}`);
    return response as OrderResponse;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse["data"]>("/orders", payload);
    return response as OrderResponse;
  },

  createDirectOrder: async (payload: CreateDirectOrderPayload): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse["data"]>("/orders/direct", payload);
    return response as OrderResponse;
  },

  cancelOrder: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse["data"]>(`/orders/${orderId}/cancel`);
    return response as OrderResponse;
  },

  getMyTrees: async (params?: OrderParams): Promise<MyTreesResponse> => {
    const response = await api.get<MyTreesResponse["data"]>("/my-trees", { params });
    return response as MyTreesResponse;
  },

  validateCoupon: async (code: string, amount: number): Promise<ApiResponse<{ coupon_id: number; code: string; discount: number }>> => {
    const response = await api.post("/orders/validate-coupon", { code, amount });
    return response as ApiResponse<{ coupon_id: number; code: string; discount: number }>;
  },
};
