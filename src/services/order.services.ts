"use client";

import api from "@/lib/axios";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_type: number; 
  type: number; 
  quantity: number;
  duration?: number;
  price: number;
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

export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string; 
  order_status: string; 
  payment_method?: string;
  transaction_id?: string;
  shipping_address_id?: number;
  shipping_address?: ShippingAddress;
  coupon_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

export interface CreateOrderPayload {
  shipping_address_id?: number;
  coupon_code?: string;
  notes?: string;
  cart_type?: number; 
}

export interface CreateDirectOrderPayload {
  
  item_type?: "tree" | "product";
  tree_instance_id?: number;
  tree_plan_price_id?: number;
  product_id?: number;
  product_variant_id?: number;
  campaign_id?: number;
  quantity?: number;
  coupon_id?: number;
  shipping_address_id?: number;

  
  product_type?: number; 
  type?: number; 
  duration?: number;
  coupon_code?: string;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
}

export interface MyTreesResponse {
  success: boolean;
  message: string;
  data: {
    sponsored: Order[];
    adopted: Order[];
  };
}

export interface OrderParams {
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}


export const orderService = {
  
  getOrders: async (params?: OrderParams): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders", { params });
    return response.data;
  },

  
  getOrderById: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  
  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/orders", payload);
    return response.data;
  },

  
  createDirectOrder: async (
    payload: CreateDirectOrderPayload,
  ): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/orders/direct", payload);
    return response.data;
  },

  
  cancelOrder: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>(`/orders/${orderId}/cancel`);
    return response.data;
  },

  
  getMyTrees: async (): Promise<MyTreesResponse> => {
    const response = await api.get<MyTreesResponse>("/my-trees");
    return response.data;
  },

  
  initiatePayment: async (orderId: number) => {
    const response = await api.post(`/orders/${orderId}/payment/initiate`, {
      payment_method: "razorpay",
    });
    return response.data;
  },

  
  verifyPayment: async (
    orderId: number,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) => {
    const response = await api.post(
      `/orders/${orderId}/payment/verify`,
      paymentData,
    );
    return response.data;
  },

  
  getPaymentStatus: async (orderId: number) => {
    const response = await api.get(`/orders/${orderId}/payment/status`);
    return response.data;
  },

  
  calculateTotal: (items: OrderItem[]): number => {
    return items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  },

  
  getOrderStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      shipped: "Shipped",
      delivered: "Delivered",
    };

    return statusMap[status.toLowerCase()] || status;
  },

  
  getPaymentStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded",
    };

    return statusMap[status.toLowerCase()] || status;
  },

  
  getOrderStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      processing: "blue",
      completed: "green",
      cancelled: "red",
      shipped: "purple",
      delivered: "green",
    };

    return colorMap[status.toLowerCase()] || "gray";
  },

  
  canBeCancelled: (order: Order): boolean => {
    const cancellableStatuses = ["pending", "processing"];
    return cancellableStatuses.includes(order.order_status.toLowerCase());
  },

  
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  
  formatTime: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};
